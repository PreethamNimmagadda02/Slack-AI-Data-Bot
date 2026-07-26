# Slack AI Data Bot 📊⚡

A Slack Bot application that allows users to ask natural language questions about their data and instantly receive database results, charts, and CSV exports directly in Slack.

## Features

- **Natural Language to SQL:** Uses LangChain and OpenAI (`gpt-4o-mini`) to translate plain English questions into PostgreSQL queries.
- **Interactive Results:** Formats query outputs into clean Slack Block Kit tables.
- **Auto-Charting:** Automatically generates bar or pie charts (via QuickChart) when querying aggregations.
- **CSV Exports:** Includes a 1-click button to export any query result as a `.csv` file directly into the Slack thread.
- **Smart Caching:** Frequently asked questions are cached in-memory instantly without hitting OpenAI or the database.
- **SQL Safeguards:** Built-in validation ensures generated queries are safe (read-only `SELECT` statements) and confined to the allowed tables.

---

## Prerequisites

1. **Node.js** (v18+)
2. **PostgreSQL** (v14+)
3. **OpenAI API Key**
4. **Slack Workspace** (with permission to create apps)
5. **ngrok** (for local development routing)

---

## 🚀 Quick Setup

### 1. Database Setup

Install and start PostgreSQL, then initialize the database and seed data:

```bash
# Install dependencies
npm install

# Run the setup script to create the 'analytics' DB and 'sales_daily' table
npm run db:setup
```

### 2. Slack App Configuration

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app "From Scratch".
2. Go to **OAuth & Permissions** and add the following **Bot Token Scopes**:
   - `commands` (To register the slash command)
   - `chat:write` (To send messages in channels)
   - `files:write` (To upload the CSV exports)
3. Go to **Slash Commands** and create a new command:
   - Command: `/ask-data`
   - Request URL: `https://<your-ngrok-url>.ngrok-free.app/slack/events`
   - Short Description: Ask questions about sales data.
4. Go to **Interactivity & Shortcuts**, turn it ON, and set the Request URL to the exact same ngrok URL.
5. Install the App to your workspace.

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
OPENAI_API_KEY=sk-your-openai-api-key
DATABASE_URL=postgresql://localhost:5432/analytics
PORT=3000
```

### 4. Run the Bot

Start your ngrok tunnel:
```bash
ngrok http 3000
```

Start the Node.js app:
```bash
npm run dev
```

---

## Usage

In any Slack channel where the bot is invited, simply type:

> `/ask-data view total revenue by region for September 2025`

The bot will respond with:
1. The generated SQL query.
2. A Data Chart (if applicable).
3. A nicely formatted markdown table of the results.
4. An `[Export CSV]` button to download the data.

### Example Queries
- *"show revenue by region for 2025-09-01"*
- *"who are our top 2 regions by revenue?"*
- *"what was the average revenue across all regions?"*
