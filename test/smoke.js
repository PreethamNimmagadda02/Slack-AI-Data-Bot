/**
 * Smoke test — verifies NL→SQL and DB query work independently.
 *
 * Usage: node test/smoke.js
 * Requires: .env configured, Postgres running with analytics DB set up.
 */

require('dotenv').config();

const { generateSql } = require('../src/services/nlToSql');
const { executeQuery, closePool } = require('../src/services/database');

async function run() {
    let passed = 0;
    let failed = 0;

    // Test 1: generateSql returns a SELECT statement
    console.log('\n🧪 Test 1: NL → SQL generation');
    try {
        const sql = await generateSql('Show total revenue by region');
        console.log(`   SQL: ${sql}`);
        if (sql.toUpperCase().startsWith('SELECT')) {
            console.log('   ✅ PASS — Starts with SELECT');
            passed++;
        } else {
            console.log('   ❌ FAIL — Does not start with SELECT');
            failed++;
        }
    } catch (err) {
        console.log(`   ❌ FAIL — Error: ${err.message}`);
        failed++;
    }

    // Test 2: executeQuery returns rows
    console.log('\n🧪 Test 2: Direct SQL execution');
    try {
        const { rows } = await executeQuery(
            'SELECT region, SUM(revenue) AS total_revenue FROM public.sales_daily GROUP BY region ORDER BY total_revenue DESC'
        );
        console.log(`   Rows: ${JSON.stringify(rows)}`);
        if (rows.length > 0) {
            console.log('   ✅ PASS — Got rows back');
            passed++;
        } else {
            console.log('   ❌ FAIL — No rows returned');
            failed++;
        }
    } catch (err) {
        console.log(`   ❌ FAIL — Error: ${err.message}`);
        failed++;
    }

    // Summary
    console.log(`\n📋 Results: ${passed} passed, ${failed} failed\n`);

    await closePool();
    process.exit(failed > 0 ? 1 : 0);
}

run();
