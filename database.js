require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const sql = neon(process.env.DATABASE_URL);

// Create users table if it doesn't exist
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `;
    console.log("Database connected & users table ready!");
  } catch (err) {
    console.error("Error setting up database:", err);
  }
}

initDB();

module.exports = sql;