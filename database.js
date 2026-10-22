require("dotenv").config();
const dns = require("dns");
const { Pool } = require("pg");

// Ensure Neon host can resolve even if local network DNS refuses or blocks it
const originalLookup = dns.lookup;
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  console.warn("Could not set custom DNS servers:", e.message);
}

dns.lookup = function (hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return originalLookup(hostname, options, callback);
    }
    if (options && options.all) {
      return callback(
        null,
        addresses.map((a) => ({ address: a, family: 4 }))
      );
    }
    callback(null, addresses[0], 4);
  });
};

if (!process.env.DATABASE_URL) {
  console.error("WARNING: DATABASE_URL environment variable is missing.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// SQL tagged template literal & standard query function
function sql(strings, ...values) {
  if (typeof strings === "string") {
    return pool.query(strings, values).then((res) => res.rows);
  }

  // Handle tagged template literal: sql`SELECT * FROM users WHERE email = ${email}`
  let queryText = "";
  for (let i = 0; i < strings.length; i++) {
    queryText += strings[i];
    if (i < values.length) {
      queryText += `$${i + 1}`;
    }
  }

  return pool.query(queryText, values).then((res) => res.rows);
}

sql.pool = pool;
sql.query = (text, params) => pool.query(text, params);

// Initialize DB schema & default seed resources
async function initDB() {
  try {
    // 1. Create users table if not exists & ensure created_at column exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    } catch (colErr) {
      // Ignore if column already exists or ALTER not permitted
    }

    // 2. Create resources table for persistent uploads and study notes
    await sql`
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        reading_time TEXT DEFAULT '5 min read',
        level TEXT DEFAULT 'Undergraduate',
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        file_url TEXT,
        uploader_name TEXT DEFAULT 'Verified Faculty',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("✓ Neon PostgreSQL connected: `users` & `resources` tables verified.");
  } catch (err) {
    console.error("Database initialization notice:", err.message);
  }
}

initDB();

module.exports = sql;