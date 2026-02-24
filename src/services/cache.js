/**
 * Caching Service
 * Caches generated SQL and query results to speed up repeated questions.
 */

const NodeCache = require('node-cache');

// Cache values for 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Normalize a question to act as a cache key.
 * Converts to lowercase, trims, and removes trailing punctuation.
 * @param {string} question - The raw user question
 * @returns {string} - The normalized cache key
 */
function normalizeKey(question) {
    return question.toLowerCase().trim().replace(/[?!.]$/, '');
}

/**
 * Get cached results for a question.
 * @param {string} question - The user question
 * @returns {object|null} - The cached data { sql, rows, fields, timestamp } or null
 */
function getCachedResult(question) {
    const key = normalizeKey(question);
    return cache.get(key) || null;
}

/**
 * Store results in the cache.
 * @param {string} question - The user question
 * @param {string} sql - The generated SQL
 * @param {Array} rows - Database results
 * @param {Array} fields - Database fields
 */
function setCachedResult(question, sql, rows, fields) {
    const key = normalizeKey(question);
    cache.set(key, { sql, rows, fields, timestamp: Date.now() });
}

module.exports = { getCachedResult, setCachedResult };
