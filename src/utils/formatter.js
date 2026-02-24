/**
 * Result Formatter
 * Formats query results and errors into Slack Block Kit messages.
 */

const { generateChartUrl } = require('../services/chart');

/**
 * Format query results into Slack Block Kit blocks.
 * @param {string} question - The original user question
 * @param {string} sql - The generated SQL
 * @param {Array} rows - Query result rows
 * @param {Array} fields - Query result field metadata
 * @param {boolean} isCached - Whether this result was loaded from cache
 * @returns {object} Slack message payload with blocks
 */
function formatResultsForSlack(question, sql, rows, fields, isCached = false) {
    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `💬 *Question:* ${question} ${isCached ? '⚡ _(cached)_' : ''}`,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `🔍 *Generated SQL:*\n\`\`\`${sql}\`\`\``,
            },
        },
        { type: 'divider' },
    ];

    if (!rows || rows.length === 0) {
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '📭 *No results found.*',
            },
        });
        return { blocks };
    }

    // Generate chart if applicable
    const chartUrl = generateChartUrl(rows, fields);
    if (chartUrl) {
        blocks.push({
            type: 'image',
            image_url: chartUrl,
            alt_text: 'Query Results Chart'
        });
        blocks.push({ type: 'divider' });
    }

    // Build a compact text table
    const columnNames = fields.map((f) => f.name);
    const maxRows = 10;
    const displayRows = rows.slice(0, maxRows);

    // Calculate column widths
    const widths = columnNames.map((col) => {
        const values = displayRows.map((row) => String(row[col] ?? ''));
        return Math.max(col.length, ...values.map((v) => v.length));
    });

    // Header
    const header = columnNames.map((col, i) => col.padEnd(widths[i])).join(' | ');
    const separator = widths.map((w) => '-'.repeat(w)).join('-+-');

    // Rows
    const tableRows = displayRows.map((row) =>
        columnNames.map((col, i) => String(row[col] ?? '').padEnd(widths[i])).join(' | ')
    );

    let table = `${header}\n${separator}\n${tableRows.join('\n')}`;

    if (rows.length > maxRows) {
        table += `\n\n... and ${rows.length - maxRows} more rows`;
    }

    blocks.push({
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `📊 *Results* (${rows.length} row${rows.length !== 1 ? 's' : ''}):\n\`\`\`${table}\`\`\``,
        }
    });

    // Add Action block with Export CSV button
    blocks.push({
        type: 'actions',
        elements: [
            {
                type: 'button',
                text: {
                    type: 'plain_text',
                    text: '📥 Export CSV',
                    emoji: true
                },
                value: String(question), // Pass the question to retrieve from cache later
                action_id: 'export_csv'
            }
        ]
    });

    return { blocks };
}

/**
 * Format an error into a Slack Block Kit message.
 * @param {string} question - The original user question
 * @param {Error|string} error - The error that occurred
 * @returns {object} Slack message payload with blocks
 */
function formatErrorForSlack(question, error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    const blocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `💬 *Question:* ${question}`,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `❌ *Error:*\n\`\`\`${errorMessage}\`\`\``,
            },
        },
    ];

    return { blocks };
}

module.exports = { formatResultsForSlack, formatErrorForSlack };
