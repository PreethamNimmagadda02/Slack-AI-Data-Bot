/**
 * NL → SQL Service
 * Uses LangChain + OpenAI to convert natural language questions into SQL.
 */

const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

const SYSTEM_PROMPT = `You are a SQL expert. You have access to a PostgreSQL database with the following table:

Table: public.sales_daily
Columns:
  - date        (date)         — The date of the sales record
  - region      (text)         — Geographic region: North, South, East, West
  - category    (text)         — Product category: Electronics, Grocery, Fashion
  - revenue     (numeric)      — Revenue amount in dollars
  - orders      (integer)      — Number of orders
  - created_at  (timestamptz)  — Row creation timestamp

Primary Key: (date, region, category)

Seed data covers dates 2025-09-01 and 2025-09-02 across various regions and categories.

Rules:
1. Output ONLY a single valid PostgreSQL SELECT statement.
2. Do NOT include any markdown formatting, code fences, or explanation.
3. Do NOT include semicolons at the end.
4. Use appropriate aggregation functions when the question implies summarization.
5. Always reference the table as public.sales_daily.`;

const model = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0,
});

const prompt = ChatPromptTemplate.fromMessages([
    ['system', SYSTEM_PROMPT],
    ['human', '{question}'],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

/**
 * Convert a natural language question into a SQL SELECT statement.
 * @param {string} question - The user's natural language question
 * @returns {Promise<string>} - A single SQL SELECT statement
 */
async function generateSql(question) {
    const sql = await chain.invoke({ question });
    return sql.trim();
}

module.exports = { generateSql };
