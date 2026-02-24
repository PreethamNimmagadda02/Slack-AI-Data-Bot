/**
 * Database setup script
 * Connects to Postgres and creates the sales_daily table with seed data.
 *
 * Usage: npm run db:setup
 *
 * NOTE: The database 'analytics' must already exist.
 *       Create it manually: CREATE DATABASE analytics;
 *       Or run: psql -U postgres -c "CREATE DATABASE analytics;"
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

require('dotenv').config();

async function setup() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('✅ Connected to Postgres');

        // Read and execute the SQL file (skip CREATE DATABASE and \c commands)
        const sqlFile = fs.readFileSync(
            path.join(__dirname, 'setup.sql'),
            'utf-8'
        );

        // Filter out psql meta-commands and CREATE DATABASE
        const statements = sqlFile
            .split('\n')
            .filter(line => !line.startsWith('\\c') && !line.startsWith('CREATE DATABASE'))
            .join('\n');

        await client.query(statements);
        console.log('✅ Table created and seed data inserted');

        // Verify
        const result = await client.query('SELECT COUNT(*) FROM public.sales_daily');
        console.log(`✅ Verified: ${result.rows[0].count} rows in sales_daily`);
    } catch (err) {
        console.error('❌ Setup failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setup();
