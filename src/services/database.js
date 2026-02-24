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

module.exports = { executeQuery, closePool };
