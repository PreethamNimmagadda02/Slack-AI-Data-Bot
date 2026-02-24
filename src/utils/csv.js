/**
 * CSV Export Service
 * Converts JSON array database results into a CSV string.
 */

const { Parser } = require('json2csv');

/**
 * Generate a CSV string from database result rows.
 * @param {Array} rows - Database query result rows
 * @returns {string} - CSV formatted string
 */
function generateCsv(rows) {
    if (!rows || rows.length === 0) {
        return '';
    }

    const parser = new Parser();
    return parser.parse(rows);
}

module.exports = { generateCsv };
