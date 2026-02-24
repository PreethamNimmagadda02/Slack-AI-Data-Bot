/**
 * SQL Validator
 * Ensures the generated SQL is safe and targets the correct table.
 */

const FORBIDDEN_KEYWORDS = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE'];

/**
 * Validate that a SQL query is a valid, read-only SELECT statement.
 * @param {string} sql - The SQL statement to validate
 * @throws {Error} - If validation fails
 */
function validateSql(sql) {
    if (!sql) {
        throw new Error('Generated SQL is empty.');
    }

    const upperSql = sql.toUpperCase().trim();

    // Must start with SELECT
    if (!upperSql.startsWith('SELECT')) {
        throw new Error('Only SELECT queries are allowed.');
    }

    // Must not contain destructive keywords
    for (const keyword of FORBIDDEN_KEYWORDS) {
        // Regex ensures we match whole words only (e.g., 'DROP' but not 'DROPLET')
        const regex = new RegExp(`\\b${keyword}\\b`);
        if (regex.test(upperSql)) {
            throw new Error(`Queries containing '${keyword}' are not allowed.`);
        }
    }

    // Must query from public.sales_daily
    if (!upperSql.includes('SALES_DAILY')) {
        throw new Error('Queries must target the public.sales_daily table.');
    }
}

module.exports = { validateSql };
