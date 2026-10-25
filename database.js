require("dotenv").config();
const dns = require("dns");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Default Neon connection string provided by user
const NEON_DEFAULT_URL = "postgresql://neondb_owner:npg_YX1NqfCu0Whc@ep-lingering-night-b4ed5h7r-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const connectionString = process.env.DATABASE_URL || NEON_DEFAULT_URL;

// Ensure Neon host can resolve even if local network DNS refuses or blocks it (local only)
if (!process.env.VERCEL) {
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
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 15000,
  connectionTimeoutMillis: 10000
});

pool.on("error", (err) => {
  console.warn("Notice: Neon pool idle connection refreshed:", err.message);
});

// SQL tagged template literal & standard query function with auto-retry
async function executeQuery(queryText, values) {
  try {
    const res = await pool.query(queryText, values);
    return res.rows;
  } catch (err) {
    if (
      err.message.includes("Connection terminated") ||
      err.message.includes("socket hang up") ||
      err.message.includes("closed")
    ) {
      const res = await pool.query(queryText, values);
      return res.rows;
    }
    throw err;
  }
}

function sql(strings, ...values) {
  if (typeof strings === "string") {
    return executeQuery(strings, values);
  }

  // Handle tagged template literal: sql`SELECT * FROM users WHERE email = ${email}`
  let queryText = "";
  for (let i = 0; i < strings.length; i++) {
    queryText += strings[i];
    if (i < values.length) {
      queryText += `$${i + 1}`;
    }
  }

  return executeQuery(queryText, values);
}

sql.pool = pool;
sql.query = (text, params) => pool.query(text, params);

// Initialize DB schema, roles & default admin account
async function initDB() {
  try {
    // 1. Create users table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure columns exist on pre-existing table
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`;
    } catch (e) {}

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    } catch (e) {}

    // 2. Create resources table
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

    // 3. Ensure master admin account exists
    const adminEmail = "admin.studyportal@gmail.com";
    const legacyAdminEmail = "admin@studyportal.edu";

    // Migrate legacy admin if present, preserving password
    try {
      const legacyAdmin = await sql`
        SELECT id FROM users WHERE LOWER(email) = LOWER(${legacyAdminEmail})
      `;
      if (legacyAdmin.length > 0) {
        const newAdminExists = await sql`
          SELECT id FROM users WHERE LOWER(email) = LOWER(${adminEmail})
        `;
        if (newAdminExists.length === 0) {
          await sql`
            UPDATE users 
            SET email = ${adminEmail}, role = 'admin' 
            WHERE id = ${legacyAdmin[0].id}
          `;
          console.log(`✓ Migrated master administrator to ${adminEmail} (password preserved).`);
        }
      }
    } catch (migErr) {
      console.warn("Notice during admin migration check:", migErr.message);
    }

    const existingAdmin = await sql`
      SELECT id, role FROM users WHERE LOWER(email) = LOWER(${adminEmail})
    `;

    if (existingAdmin.length === 0) {
      const hashedAdminPassword = bcrypt.hashSync("adminpassword123", 10);
      await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('System Administrator', ${adminEmail}, ${hashedAdminPassword}, 'admin')
      `;
      console.log(`✓ Master administrator initialized: ${adminEmail} / adminpassword123`);
    } else if (existingAdmin[0].role !== "admin") {
      await sql`UPDATE users SET role = 'admin' WHERE id = ${existingAdmin[0].id}`;
      console.log("✓ Existing admin user role updated to 'admin'.");
    }

    console.log("✓ Neon PostgreSQL connected: `users` (with role-based access) & `resources` tables verified.");
  } catch (err) {
    console.error("Database initialization notice:", err.message);
  }
}

initDB();

module.exports = sql;