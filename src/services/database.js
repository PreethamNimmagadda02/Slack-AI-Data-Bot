/**
 * Database service
 * Manages a Postgres connection pool and provides query execution.
 */

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client:', err);
});

/**
 * Execute a SQL query and return rows + fields.
 * @param {string} sql - The SQL statement to execute
 * @returns {Promise<{rows: Array, fields: Array}>}
 */
async function executeQuery(sql) {
    const client = await pool.connect();
    try {
        const result = await client.query(sql);
        return {
            rows: result.rows,
            fields: result.fields,
        };
    } finally {
        client.release();
    }
}

/**
 * Close the connection pool (for graceful shutdown).
 */
async function closePool() {
    await pool.end();
}

/**
 * Get the schema (columns and types) for a specified table.
 * @param {string} tableName - The name of the table
 * @returns {Promise<string>} - Formatted string representing the table schema
 */
async function getTableSchema(tableName) {
    const { rows } = await executeQuery(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' AND table_schema = 'public'
    `);

    if (rows.length === 0) {
        throw new Error(`Table ${tableName} not found in public schema.`);
    }

    const columns = rows.map(r => `  - ${r.column_name.padEnd(15)} (${r.data_type})`).join('\n');
    return `Table: public.${tableName}\nColumns:\n${columns}`;
}

module.exports = { executeQuery, closePool, getTableSchema };

