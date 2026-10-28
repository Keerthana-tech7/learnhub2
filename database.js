require("dotenv").config();
const dns = require("dns");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// Default Neon connection string provided by user
const NEON_DEFAULT_URL = "postgresql://neondb_owner:npg_YX1NqfCu0Whc@ep-lingering-night-b4ed5h7r-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const connectionString = process.env.DATABASE_URL || NEON_DEFAULT_URL;

// Pre-seeded DNS cache for Neon AWS pooler endpoints to eliminate 3.5s+ DNS roundtrips on Windows
const DNS_CACHE = new Map([
  ["ep-lingering-night-b4ed5h7r-pooler.c-6.us-east-2.aws.neon.tech", ["77.112.100.143", "52.14.39.200", "52.95.251.153"]]
]);

// Ensure Neon host can resolve instantly even if local network DNS refuses or blocks it (local only)
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

    // 1. Fast path: return cached IP addresses in 0ms
    if (DNS_CACHE.has(hostname)) {
      const addresses = DNS_CACHE.get(hostname);
      if (options && options.all) {
        return process.nextTick(() =>
          callback(null, addresses.map((a) => ({ address: a, family: 4 })))
        );
      }
      return process.nextTick(() => callback(null, addresses[0], 4));
    }

    // 2. Fallback: resolve and store in cache
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return originalLookup(hostname, options, callback);
      }
      DNS_CACHE.set(hostname, addresses);
      if (options && options.all) {
        return callback(
          null,
          addresses.map((a) => ({ address: a, family: 4 }))
        );
      }
      callback(null, addresses[0], 4);
    });
  };

  // Background refresh of DNS cache every 30 minutes without blocking queries
  const dnsRefreshTimer = setInterval(() => {
    for (const host of DNS_CACHE.keys()) {
      dns.resolve4(host, (err, addresses) => {
        if (!err && addresses && addresses.length > 0) {
          DNS_CACHE.set(host, addresses);
        }
      });
    }
  }, 30 * 60 * 1000);
  if (dnsRefreshTimer.unref) dnsRefreshTimer.unref();
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  min: 0,
  max: 15,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 20000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

pool.on("error", (err) => {
  console.warn("Notice: Neon pool background connection event:", err.message);
});

// Periodic heartbeat to prevent AWS/Neon pooler from dropping idle connections
const poolHeartbeat = setInterval(() => {
  pool.query("SELECT 1").catch(() => {});
}, 30000);
if (poolHeartbeat.unref) poolHeartbeat.unref();

// SQL tagged template literal & standard query function with instant auto-retry
async function executeQuery(queryText, values) {
  try {
    const res = await pool.query(queryText, values);
    return res.rows;
  } catch (err) {
    const msg = (err && err.message) || "";
    if (
      msg.includes("Connection terminated") ||
      msg.includes("socket hang up") ||
      msg.includes("closed") ||
      msg.includes("timeout") ||
      msg.includes("ECONNRESET")
    ) {
      // Pause briefly to allow AWS Neon pooler to complete reconnection
      await new Promise((r) => setTimeout(r, 600));
      try {
        const res = await pool.query(queryText, values);
        return res.rows;
      } catch (retryErr) {
        throw retryErr;
      }
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
        uploader_email TEXT,
        uploader_id INT,
        status TEXT DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure status and contributor tracking columns exist on pre-existing table
    try {
      await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved'`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS uploader_email TEXT`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS uploader_id INT`;
    } catch (e) {}
    try {
      await sql`UPDATE resources SET status = 'approved' WHERE status IS NULL`;
    } catch (e) {}

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

    // 4. Create admin notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id SERIAL PRIMARY KEY,
        type TEXT DEFAULT 'user_registered',
        recipient TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_email TEXT NOT NULL,
        user_role TEXT DEFAULT 'user',
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        details TEXT
      )
    `;

    // 5. Create contributions table (Requirement 5)
    await sql`
      CREATE TABLE IF NOT EXISTS contributions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        contributor_name TEXT NOT NULL,
        contributor_email TEXT NOT NULL,
        resource_title TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        existing_resource_id TEXT,
        description TEXT,
        contribution_content TEXT,
        file_path TEXT,
        status TEXT DEFAULT 'Pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewed_by TEXT,
        admin_feedback TEXT
      )
    `;

    // Ensure columns exist on pre-existing contributions table
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General'`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS existing_resource_id TEXT`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS description TEXT`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS contribution_content TEXT`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS file_path TEXT`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending'`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS reviewed_by TEXT`;
    } catch (e) {}
    try {
      await sql`ALTER TABLE contributions ADD COLUMN IF NOT EXISTS admin_feedback TEXT`;
    } catch (e) {}

    // 6. Create performance indexes for instant queries
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_role_email ON users (role, email)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_resources_status_created ON resources (status, created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON admin_notifications (registered_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_contributions_status_submitted ON contributions (status, submitted_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions (user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_contributions_existing_res ON contributions (existing_resource_id)`;
    } catch (idxErr) {}

    console.log("✓ Neon PostgreSQL connected: `users`, `resources`, `contributions` & `admin_notifications` tables verified.");
  } catch (err) {
    console.error("Database initialization notice:", err.message);
  }
}

initDB();

module.exports = sql;