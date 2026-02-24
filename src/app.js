/**
 * Slack App
 * Initializes the Slack Bolt app and registers the /ask-data slash command.
 */

const { App } = require('@slack/bolt');
const { generateSql } = require('./services/nlToSql');
const { executeQuery } = require('./services/database');
const { formatResultsForSlack, formatErrorForSlack } = require('./utils/formatter');
const { validateSql } = require('./utils/validator');
const { getCachedResult, setCachedResult } = require('./services/cache');
const { generateCsv } = require('./utils/csv');


const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Register the /ask-data slash command
app.command('/ask-data', async ({ command, ack, respond }) => {
    // Acknowledge immediately (Slack requires response within 3 seconds)
    await ack();

    const question = command.text?.trim();

    // Handle empty input
    if (!question) {
        await respond({
            response_type: 'ephemeral',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: '⚠️ *Usage:* `/ask-data <your question>`\n\nExample: `/ask-data show revenue by region for 2025-09-01`',
                    },
                },
            ],
        });
        return;
    }

    try {
        console.log(`\n📨 Question: "${question}"`);

        // Step 1: Check Cache
        const cached = getCachedResult(question);
        if (cached) {
            console.log(`⚡ Using cached result for: "${question}"`);
            const message = formatResultsForSlack(question, cached.sql, cached.rows, cached.fields, true);
            await respond({ response_type: 'in_channel', ...message });
            return;
        }

        // Step 2: Generate SQL
        const sql = await generateSql(question);
        console.log(`🔍 Generated SQL: ${sql}`);

        // Step 3: Validate SQL Safeguards
        validateSql(sql);

        // Step 4: Execute SQL against Postgres
        const { rows, fields } = await executeQuery(sql);
        console.log(`📊 Got ${rows.length} rows`);

        // Step 5: Format, Cache, and Respond
        setCachedResult(question, sql, rows, fields);
        const message = formatResultsForSlack(question, sql, rows, fields, false);
        await respond({
            response_type: 'in_channel',
            ...message,
        });
    } catch (error) {
        console.error('❌ Error processing question:', error);

        // Reply with the error in a code block
        const errorMessage = formatErrorForSlack(question, error);
        await respond({
            response_type: 'ephemeral',
            ...errorMessage,
        });
    }
});

// Listener for the "Export CSV" button
app.action('export_csv', async ({ body, ack, client }) => {
    await ack();

    try {
        const question = body.actions[0].value;
        const channelId = body.channel.id;
        const threadTs = body.message.ts;

        console.log(`📥 Export CSV requested for question: "${question}"`);

        // Check cache first
        let rows, fields;
        const cached = getCachedResult(question);

        if (cached) {
            rows = cached.rows;
            fields = cached.fields;
        } else {
            // Re-run if cache expired
            const sql = await generateSql(question);
            validateSql(sql);
            const result = await executeQuery(sql);
            rows = result.rows;
            fields = result.fields;
        }

        // Generate CSV content
        const csvString = generateCsv(rows);

        // Upload to Slack using the new files.uploadV2 API
        await client.files.uploadV2({
            channel_id: channelId,
            thread_ts: threadTs, // Post in thread to keep things tidy
            content: csvString,
            filename: 'query_results.csv',
            title: `Data Export: ${question}`,
            initial_comment: 'Here is your CSV export! 📊'
        });

        console.log('✅ CSV exported successfully');
    } catch (error) {
        console.error('❌ Error exporting CSV:', error);
    }
});

/**
 * Start the Slack app.
 * @param {number} port - Port to listen on
 */
async function startApp(port = 3000) {
    await app.start(port);
    console.log(`⚡ Slack Data Bot is running on port ${port}`);
}

module.exports = { startApp };
