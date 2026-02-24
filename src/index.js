/**
 * Entry point for the Slack Data Bot
 */

require('dotenv').config();

const { startApp } = require('./app');
const { closePool } = require('./services/database');

const port = parseInt(process.env.PORT, 10) || 3000;

startApp(port);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down...');
    await closePool();
    process.exit(0);
});
