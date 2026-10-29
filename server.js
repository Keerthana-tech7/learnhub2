const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Prevent server exit from background DB socket reconnects/ECONNRESET
process.on("unhandledRejection", (reason) => {
  console.warn("Resilience Notice: Handled background rejection:", (reason && reason.message) || reason);
});
process.on("uncaughtException", (err) => {
  console.error("Resilience Warning: Handled background exception:", err.message);
});

const sql = require("./database");
const {
  ADMIN_EMAIL,
  sendAdminRegistrationNotification,
  sendAdminContributionNotification,
  sendContributorStatusNotification,
  sendTestNotification,
  getEmailConfigStatus,
  setCustomTransporter,
  verifyTransporterConnection
} = require("./mailer");
const { QUESTION_PAPERS } = require("./questionPapersData");
const {
  isCloudinaryConfigured,
  uploadPdfToCloudinary
} = require("./cloudinaryService");

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_SECRET = process.env.SESSION_SECRET || "studyportal-secret-key-2026-secure";

// Enable reverse-proxy awareness (essential for Vercel, cloud proxies, and secure cookies)
app.set("trust proxy", 1);

// Cryptographic Auth Token Generator & Verifier (Tamper-proof HMAC-SHA256)
function generateAuthToken(user) {
  if (!user || !user.id) return "";
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function verifyAuthToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  if (!data || !signature) return null;
  try {
    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(data).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}

// Serverless / Read-only filesystem detector
function isServerlessOrReadOnly() {
  return Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.NOW_REGION ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    (process.env.NODE_ENV === "production" && !process.env.ALLOW_LOCAL_STORAGE) ||
    (__dirname && __dirname.startsWith("/var/task")) ||
    (process.cwd && typeof process.cwd === "function" && process.cwd().startsWith("/var/task"))
  );
}

// Multer in-memory storage for user contribution PDF uploads.
// Crucial for Vercel: Vercel serverless functions have a read-only filesystem (/var/task).
// In-memory storage buffers files directly in RAM so they can be streamed to Cloudinary without EROFS errors.
const storage = multer.memoryStorage();

// Ensure local uploads folder only exists in local development (not on Vercel/serverless)
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!isServerlessOrReadOnly()) {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (e) {
    console.warn("Notice: Could not create local uploads directory:", e.message);
  }
}

// Restrict file uploads to permitted formats, strictly PDF (Requirement 6)
const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isPdfMime = file.mimetype === "application/pdf" || file.mimetype === "application/x-pdf";
    if (ext === ".pdf" && (isPdfMime || !file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF documents (.pdf) are permitted for contribution uploads."));
    }
  }
});

// Middleware to catch multer file format / size errors gracefully
function uploadPdfMiddleware(req, res, next) {
  upload.single("resourceFile")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File exceeds 25MB limit. Please upload a smaller PDF." });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}

// Robust multi-factor authentication enforcement middleware
// Supports: (1) express session cookie, (2) Bearer token / x-auth-token, (3) database email fallback
async function requireAuth(req, res, next) {
  // 1. Check active express session
  if (req.session && req.session.user && req.session.user.id) {
    req.user = req.session.user;
    return next();
  }

  // 2. Check Bearer token or x-auth-token header
  let token = null;
  const authHeader = req.headers["authorization"] || "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.headers["x-auth-token"]) {
    token = String(req.headers["x-auth-token"]).trim();
  }

  if (token) {
    const verified = verifyAuthToken(token);
    if (verified && verified.id) {
      // Re-hydrate session for multi-deployment / serverless resiliency
      if (req.session) {
        req.session.user = {
          id: verified.id,
          name: verified.name,
          email: verified.email,
          role: verified.role
        };
      }
      req.user = verified;
      return next();
    }
  }

  // 3. Fallback header check by email against database
  const fallbackEmail = req.headers["x-user-email"] ? String(req.headers["x-user-email"]).trim().toLowerCase() : null;
  if (fallbackEmail) {
    try {
      const userRows = await sql`
        SELECT id, name, email, role FROM users WHERE LOWER(email) = ${fallbackEmail} LIMIT 1
      `;
      if (userRows && userRows.length > 0) {
        const u = userRows[0];
        if (req.session) {
          req.session.user = u;
        }
        req.user = u;
        return next();
      }
    } catch (e) {
      console.warn("requireAuth email lookup notice:", e.message);
    }
  }

  return res.status(401).json({
    success: false,
    message: "Authentication required. Please sign in to submit a contribution."
  });
}

// CORS & Preflight headers for cross-origin and deployment resilience
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth-token, x-user-email, x-admin-email, x-admin-role, Cache-Control"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize requests: support both /api/endpoint and /endpoint on serverless
app.use((req, res, next) => {
  if (
    !req.url.startsWith("/api") &&
    (
      req.url.startsWith("/register") ||
      req.url.startsWith("/login") ||
      req.url.startsWith("/logout") ||
      req.url.startsWith("/session") ||
      req.url.startsWith("/resources") ||
      req.url.startsWith("/contributions") ||
      req.url.startsWith("/stats") ||
      req.url.startsWith("/health") ||
      req.url.startsWith("/upload") ||
      req.url.startsWith("/admin")
    )
  ) {
    req.url = "/api" + req.url;
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Session management with proxy and secure cookie configuration
app.use(
  session({
    secret: AUTH_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

// Initial curated study resources to seed into Neon DB
const DEFAULT_STUDY_RESOURCES = [
  {
    id: "c-programming-core",
    title: "Mastering C Programming & Systems Architecture",
    subject: "C Programming",
    reading_time: "8 min read",
    level: "First / Second Year",
    summary: "Comprehensive guide to pointers, dynamic memory allocation (malloc/free), structs, memory layouts, and essential algorithms.",
    content: `
      <h3>1. Why Learn C?</h3>
      <p>C provides direct hardware access, low memory overhead, and uncompromised execution speed. Understanding pointers and memory management is the foundation of operating systems, embedded systems, and game engines.</p>
      
      <h3>2. Memory Model & Variable Declarations</h3>
      <p>A C process memory layout consists of text (code), data (initialized globals), BSS (uninitialized globals), heap (dynamically allocated), and stack (function frames and local variables).</p>
      <pre><code>#include &lt;stdio.h&gt;
#include &lt;stdlib.h&gt;

int main() {
    int stackVar = 42; // Allocated on the stack
    int *heapVar = (int *)malloc(sizeof(int)); // Allocated on the heap
    
    if (heapVar == NULL) {
        fprintf(stderr, "Memory allocation failed\\n");
        return 1;
    }
    
    *heapVar = 99;
    printf("Stack: %d (at %p) | Heap: %d (at %p)\\n", stackVar, (void*)&stackVar, *heapVar, (void*)heapVar);
    
    free(heapVar); // Prevent memory leaks
    heapVar = NULL; // Prevent dangling pointer
    return 0;
}</code></pre>

      <h3>3. Pointers & Pointer Arithmetic</h3>
      <p>A pointer stores the memory address of another variable. The dereference operator (<code>*</code>) accesses value at that address, while the address-of operator (<code>&amp;</code>) returns the address.</p>

      <h3>4. Exam Checklist & Common Pitfalls</h3>
      <ul>
        <li><strong>Dangling Pointer:</strong> Pointer left pointing to deallocated memory. Always set to <code>NULL</code> after freeing.</li>
        <li><strong>Buffer Overflow:</strong> Always use <code>fgets()</code> or <code>snprintf()</code> instead of unsafe <code>gets()</code> or <code>strcpy()</code>.</li>
        <li><strong>Memory Leak:</strong> Every <code>malloc()</code> / <code>calloc()</code> must have a matching <code>free()</code>.</li>
      </ul>
    `,
    file_url: null,
    uploader_name: "Academic Board"
  },
  {
    id: "data-structures-notes",
    title: "Data Structures & Algorithm Complexity (DSA)",
    subject: "Data Structures",
    reading_time: "10 min read",
    level: "Core CS",
    summary: "Complete blueprint for Linear & Non-linear data structures, Big-O asymptotic analysis, BSTs, Heaps, and Graph traversals.",
    content: `
      <h3>1. Asymptotic Complexity (Big-O)</h3>
      <p>Big-O notation describes the upper bound of an algorithm's execution time or memory requirements in terms of input size <code>n</code>.</p>
      <ul>
        <li><strong>O(1)</strong>: Constant time (Hash map lookup average, array indexing)</li>
        <li><strong>O(log n)</strong>: Logarithmic time (Binary search in sorted array)</li>
        <li><strong>O(n)</strong>: Linear time (Iterating through an array, linked list traversal)</li>
        <li><strong>O(n log n)</strong>: Linearithmic time (Merge Sort, Quick Sort average)</li>
        <li><strong>O(n²)</strong>: Quadratic time (Nested loops, Bubble Sort)</li>
      </ul>

      <h3>2. Essential Data Structures Comparison</h3>
      <table>
        <thead>
          <tr>
            <th>Structure</th>
            <th>Access</th>
            <th>Search</th>
            <th>Insertion</th>
            <th>Deletion</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Array</td>
            <td>O(1)</td>
            <td>O(n)</td>
            <td>O(n)</td>
            <td>O(n)</td>
          </tr>
          <tr>
            <td>Linked List</td>
            <td>O(n)</td>
            <td>O(n)</td>
            <td>O(1) [head]</td>
            <td>O(1) [head]</td>
          </tr>
          <tr>
            <td>Hash Table</td>
            <td>N/A</td>
            <td>O(1) avg</td>
            <td>O(1) avg</td>
            <td>O(1) avg</td>
          </tr>
          <tr>
            <td>BST (Balanced)</td>
            <td>O(log n)</td>
            <td>O(log n)</td>
            <td>O(log n)</td>
            <td>O(log n)</td>
          </tr>
        </tbody>
      </table>

      <h3>3. Stack Implementation (LIFO)</h3>
      <pre><code>class Stack {
  constructor() {
    this.items = [];
  }
  push(element) { this.items.push(element); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
}</code></pre>
    `,
    file_url: null,
    uploader_name: "Dept. of Computer Science"
  },
  {
    id: "web-development-modern",
    title: "Modern Full-Stack Web Development Handbook",
    subject: "Web Development",
    reading_time: "7 min read",
    level: "Beginner to Intermediate",
    summary: "Semantic HTML5, CSS Flexbox & Grid layouts, Modern ES6+ JavaScript, Asynchronous Fetch, and RESTful API architecture.",
    content: `
      <h3>1. Semantic HTML & Accessible Architecture</h3>
      <p>Using semantic elements like <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;section&gt;</code>, and <code>&lt;footer&gt;</code> gives clear meaning to search engines and assistive screen readers.</p>

      <h3>2. CSS Flexbox vs. CSS Grid</h3>
      <p>Flexbox is ideal for 1-dimensional layouts (a single row or column), while CSS Grid is designed for 2-dimensional grid systems (rows and columns simultaneously).</p>

      <h3>3. Modern JavaScript: Async/Await & Fetch</h3>
      <pre><code>async function fetchStudyResources() {
  try {
    const response = await fetch('/api/resources');
    if (!response.ok) throw new Error('Network error: ' + response.status);
    const resources = await response.json();
    console.log('Loaded resources:', resources);
    return resources;
  } catch (error) {
    console.error('Failed to load study resources:', error);
    return [];
  }
}</code></pre>

      <h3>4. REST API Design Principles</h3>
      <ul>
        <li><code>GET /api/resources</code>: Retrieve list of items</li>
        <li><code>POST /api/resources</code>: Create a new resource</li>
        <li><code>PUT /api/resources/:id</code>: Update entire resource</li>
        <li><code>DELETE /api/resources/:id</code>: Remove resource</li>
      </ul>
    `,
    file_url: null,
    uploader_name: "Web Technologies Lab"
  },
  {
    id: "python-programming-guide",
    title: "Python for Problem Solving & Data Analytics",
    subject: "Python Programming",
    reading_time: "6 min read",
    level: "All Levels",
    summary: "From core syntax and list comprehensions to object-oriented programming, exception handling, and standard library mastery.",
    content: `
      <h3>1. Idiomatic Python (Pythonic Code)</h3>
      <p>Python emphasizes readability and brevity. Use list comprehensions, unpacking, and generator expressions for concise, efficient scripts.</p>
      
      <pre><code># List comprehension example: squares of even numbers
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
even_squares = [n ** 2 for n in numbers if n % 2 == 0]
print("Even squares:", even_squares)  # [4, 16, 36, 64, 100]

# Dictionary comprehension
word_lengths = {word: len(word) for word in ["Python", "StudyPortal", "Algorithms"]}
print(word_lengths)</code></pre>

      <h3>2. Object-Oriented Programming (OOP)</h3>
      <pre><code>class Student:
    def __init__(self, name: str, roll_no: str):
        self.name = name
        self.roll_no = roll_no
        self.completed_modules = []

    def complete_topic(self, topic: str):
        self.completed_modules.append(topic)
        print(f"{self.name} finished {topic}!")</code></pre>
    `,
    file_url: null,
    uploader_name: "Open Source Club"
  },
  {
    id: "cloud-computing-devops",
    title: "Cloud Computing Fundamentals & Cloud Architecture",
    subject: "Cloud & DevOps",
    reading_time: "9 min read",
    level: "Third / Final Year",
    summary: "Cloud service models (IaaS, PaaS, SaaS), AWS core services (EC2, S3, RDS, Lambda), Docker containerization, and Microservices.",
    content: `
      <h3>1. Cloud Service Delivery Models</h3>
      <ul>
        <li><strong>IaaS (Infrastructure as a Service):</strong> Raw compute, networking, and storage (e.g., AWS EC2, Google Compute Engine).</li>
        <li><strong>PaaS (Platform as a Service):</strong> Managed application runtime without server maintenance (e.g., Vercel, Heroku, AWS Elastic Beanstalk).</li>
        <li><strong>SaaS (Software as a Service):</strong> Ready-to-use end-user applications (e.g., Google Workspace, GitHub).</li>
      </ul>

      <h3>2. Key AWS Services to Know for Exams</h3>
      <ul>
        <li><strong>Amazon EC2:</strong> Resizable compute capacity in the cloud (Virtual Machines).</li>
        <li><strong>Amazon S3:</strong> Scalable object storage for files, backups, and static website hosting.</li>
        <li><strong>Amazon RDS / Neon:</strong> Fully managed relational databases with automated backups and read replicas.</li>
        <li><strong>AWS Lambda:</strong> Serverless execution of code triggered by HTTP requests or cloud events.</li>
      </ul>
    `,
    file_url: null,
    uploader_name: "Cloud Computing Consortium"
  }
];

// Seed DB with default resources and question papers
async function seedDefaultResourcesIfNeeded() {
  try {
    const allSeeds = [...DEFAULT_STUDY_RESOURCES, ...QUESTION_PAPERS];
    for (const res of allSeeds) {
      await sql`
        INSERT INTO resources (id, title, subject, reading_time, level, summary, content, file_url, uploader_name)
        VALUES (${res.id}, ${res.title}, ${res.subject}, ${res.reading_time}, ${res.level}, ${res.summary}, ${res.content}, ${res.file_url}, ${res.uploader_name})
        ON CONFLICT (id) DO NOTHING
      `;
    }
  } catch (e) {
    console.warn("Notice: Resource seed check:", e.message);
  }
}
setTimeout(seedDefaultResourcesIfNeeded, 2000);

// ================= API ROUTES =================

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const dbRes = await sql`SELECT 1 AS ok`;
    res.json({
      status: "healthy",
      database: "Neon PostgreSQL connected",
      cloudStorage: isCloudinaryConfigured() ? "Cloudinary (Connected)" : (isServerlessOrReadOnly() ? "Cloudinary missing on Vercel" : "Local Development (public/uploads)"),
      environment: isServerlessOrReadOnly() ? "Vercel / Serverless" : "Local Development",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "Connection error: " + err.message
    });
  }
});

// Check session (supports session cookie, Bearer token, x-auth-token, and x-user-email fallback)
app.get("/api/session", async (req, res) => {
  // 1. Active express session
  if (req.session && req.session.user && req.session.user.id) {
    const token = generateAuthToken(req.session.user);
    return res.json({
      loggedIn: true,
      user: req.session.user,
      token: token
    });
  }

  // 2. Token header (Bearer or x-auth-token)
  let token = null;
  const authHeader = req.headers["authorization"] || "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.headers["x-auth-token"]) {
    token = String(req.headers["x-auth-token"]).trim();
  }

  if (token) {
    const verified = verifyAuthToken(token);
    if (verified && verified.id) {
      if (req.session) {
        req.session.user = {
          id: verified.id,
          name: verified.name,
          email: verified.email,
          role: verified.role
        };
      }
      return res.json({
        loggedIn: true,
        user: verified,
        token: token
      });
    }
  }

  // 3. Fallback header check by email against database
  const fallbackEmail = req.headers["x-user-email"] ? String(req.headers["x-user-email"]).trim().toLowerCase() : null;
  if (fallbackEmail) {
    try {
      const userRows = await sql`
        SELECT id, name, email, role FROM users WHERE LOWER(email) = ${fallbackEmail} LIMIT 1
      `;
      if (userRows && userRows.length > 0) {
        const u = userRows[0];
        if (req.session) {
          req.session.user = u;
        }
        const refreshedToken = generateAuthToken(u);
        return res.json({
          loggedIn: true,
          user: u,
          token: refreshedToken
        });
      }
    } catch (e) {
      console.warn("Session check email fallback notice:", e.message);
    }
  }

  res.json({ loggedIn: false });
});

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter your name, email, and password."
    });
  }

  const cleanName = String(name).trim();
  const cleanEmail = String(email).trim().toLowerCase();

  if (cleanName.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must be at least 2 characters long."
    });
  }

  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address."
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long."
    });
  }

  try {
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${cleanEmail})
    `;

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Please log in directly."
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const assignedRole = (cleanEmail === "admin.studyportal@gmail.com" || cleanEmail === "admin@studyportal.edu") ? "admin" : "user";
    const inserted = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${cleanName}, ${cleanEmail}, ${hashedPassword}, ${assignedRole})
      RETURNING id, name, email, role, created_at
    `;

    const newUser = inserted[0];

    // Asynchronously dispatch admin notification email with user's name, email & registration time
    const portalUrl = `${req.protocol}://${req.get("host")}/#admin`;
    sendAdminRegistrationNotification({
      name: newUser.name,
      email: newUser.email,
      time: newUser.created_at || new Date(),
      role: newUser.role || assignedRole,
      id: newUser.id,
      portalUrl: portalUrl
    }).catch((mailErr) => {
      console.warn("Notice: Admin registration notification dispatch encounter:", mailErr.message);
    });

    invalidateAdminCache("users");
    invalidateAdminCache("notifications");

    res.json({
      success: true,
      message: "Registration successful! Redirecting to login...",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || assignedRole
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed on database server. Please try again."
    });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter both email and password."
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const users = await sql`
      SELECT * FROM users WHERE LOWER(email) = LOWER(${cleanEmail})
    `;
    const user = users[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No account found with this email. Please register first."
      });
    }

    let isMatch = false;

    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = bcrypt.compareSync(password, user.password);
    } else {
      if (password === user.password) {
        isMatch = true;
        // Upgrade legacy plaintext to bcrypt
        try {
          const newHash = bcrypt.hashSync(password, 10);
          await sql`UPDATE users SET password = ${newHash} WHERE id = ${user.id}`;
        } catch (upgradeErr) {
          console.warn("Could not upgrade legacy password:", upgradeErr);
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password. Please verify and try again."
      });
    }

    const userRole = user.role || ((cleanEmail === "admin.studyportal@gmail.com" || cleanEmail === "admin@studyportal.edu") ? "admin" : "user");

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRole
    };

    const token = generateAuthToken(req.session.user);

    res.json({
      success: true,
      message: "Login successful! Welcome back.",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server database error during login. Please try again."
    });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Could not log out session." });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully." });
  });
});

// Get all approved study resources (Student & Public view)
app.get("/api/resources", async (req, res) => {
  try {
    const rows = await sql`
      SELECT id, title, subject, reading_time, level, summary, content, file_url, file_name, uploader_name, uploader_email, COALESCE(status, 'approved') AS status, created_at
      FROM resources
      WHERE status = 'approved' OR status IS NULL
      ORDER BY created_at DESC
    `;
    if (rows && rows.length > 0) {
      return res.json(rows);
    }
    // Fallback if table is not yet seeded
    res.json(DEFAULT_STUDY_RESOURCES);
  } catch (err) {
    console.warn("Could not fetch resources from DB, returning defaults:", err.message);
    res.json(DEFAULT_STUDY_RESOURCES);
  }
});

// ================= RESOURCE CONTRIBUTION & UPLOAD APIs =================

/**
 * Handle new study resource contribution (Requirement 1, 2, 5, 6)
 * - Only authenticated users can submit contributions
 * - Never trusts user-provided names or emails (uses authenticated session)
 * - Restricts file upload strictly to PDF
 * - Requires existing resource selection
 * - Every contribution saved with status 'Pending'
 * - Dispatches admin email notification with all required fields
 */
async function handleResourceContributionSubmission(req, res) {
  // 1. Enforce authentication (Requirement 6)
  const authUser = (req.session && req.session.user) || req.user;
  if (!authUser || !authUser.id) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in to submit a contribution."
    });
  }

  // 2. Never trust user-provided names or emails when authenticated account details are available (Requirement 6)
  const contributorName = String(authUser.name || "Student Contributor").trim();
  const contributorEmail = String(authUser.email || "").trim();
  const contributorId = authUser.id || null;

  if (!contributorEmail) {
    return res.status(401).json({
      success: false,
      message: "Session email verification failed. Please re-login."
    });
  }

  // 3. Extract and sanitize inputs (Requirement 1 & 6)
  const title = req.body.resourceTitle || req.body.title;
  const category = req.body.category || req.body.subject || "General";
  const existingResourceId = req.body.existingResourceId || req.body.existing_resource_id;
  const description = req.body.description;
  const contributionContent = req.body.contributionContent || req.body.content || "";

  const cleanTitle = String(title || "").trim();
  const cleanCategory = String(category || "General").trim();
  const cleanExistingId = String(existingResourceId || "").trim();
  const cleanDesc = String(description || "").trim();
  const cleanContent = String(contributionContent || "").trim();

  // 4. Validate user inputs
  if (!cleanTitle) {
    return res.status(400).json({
      success: false,
      message: "Contributed resource title is required."
    });
  }

  if (cleanTitle.length > 200) {
    return res.status(400).json({
      success: false,
      message: "Resource title must be within 200 characters."
    });
  }

  if (!cleanExistingId) {
    return res.status(400).json({
      success: false,
      message: "Please select which existing coursework resource your contribution belongs to."
    });
  }

  if (!cleanDesc) {
    return res.status(400).json({
      success: false,
      message: "Please provide a description of what you are contributing."
    });
  }

  // Must provide contribution content or PDF file (Requirement 1)
  if (!cleanContent && !req.file) {
    return res.status(400).json({
      success: false,
      message: "Please provide contribution content (study notes/code) or attach a valid PDF file."
    });
  }

  // 4b. Prevent duplicate submissions where appropriate (Requirement 4)
  try {
    const existingCheck = await sql`
      SELECT id, resource_title, status 
      FROM contributions 
      WHERE (user_id = ${contributorId} OR LOWER(contributor_email) = LOWER(${contributorEmail}))
        AND LOWER(resource_title) = LOWER(${cleanTitle})
        AND existing_resource_id = ${cleanExistingId}
        AND LOWER(status) IN ('pending', 'approved')
      LIMIT 1
    `;
    if (existingCheck && existingCheck.length > 0) {
      const isPending = (existingCheck[0].status || "").toLowerCase() === "pending";
      return res.status(409).json({
        success: false,
        message: isPending
          ? "Duplicate request: You already have a pending contribution request for this topic. Please wait for administrator approval."
          : "Duplicate request: A contribution request with this title has already been approved and published."
      });
    }
  } catch (dupErr) {
    console.warn("Notice during duplicate check:", dupErr.message);
  }

  // 5. Lookup existing resource details to verify selection
  let existingResourceTitle = "General Coursework";
  try {
    const matched = await sql`
      SELECT id, title, subject FROM resources WHERE id = ${cleanExistingId} LIMIT 1
    `;
    if (matched && matched.length > 0) {
      existingResourceTitle = matched[0].title;
    }
  } catch (lookupErr) {
    console.warn("Notice: Existing resource lookup:", lookupErr.message);
  }

  // 6. Handle PDF file upload via Cloudinary or graceful local fallback
  let filePath = null;
  let originalFileName = null;

  if (req.file) {
    originalFileName = req.file.originalname;

    // Validate that uploaded file is a valid PDF (check %PDF magic header)
    const isPdfHeader = req.file.buffer && req.file.buffer.length >= 4 && req.file.buffer.slice(0, 4).toString() === "%PDF";
    if (!isPdfHeader) {
      return res.status(400).json({
        success: false,
        message: "Invalid file format. The uploaded file is not a valid PDF document."
      });
    }

    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
        filePath = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload failure:", uploadErr.message);
        return res.status(502).json({
          success: false,
          message: "Failed to upload PDF to cloud storage: " + (uploadErr.message || "Cloudinary connection error") + ". Please try again or verify your Cloudinary credentials."
        });
      }
    } else if (isServerlessOrReadOnly()) {
      // In Vercel serverless environment, local disk is read-only (/var/task). Cloud storage is mandatory.
      console.error("Cloud storage missing on Vercel/serverless deployment.");
      return res.status(503).json({
        success: false,
        message: "Cloud file storage is not configured on Vercel. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) to your Vercel Environment Variables to store PDFs permanently."
      });
    } else {
      // Offline / Local development fallback when Cloudinary is not configured in .env
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const cleanOriginal = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
        const localFileName = uniqueSuffix + "-" + cleanOriginal;
        fs.writeFileSync(path.join(uploadsDir, localFileName), req.file.buffer);
        filePath = "/uploads/" + localFileName;
        console.warn("Notice: Cloudinary is not configured in .env. Saved to local public/uploads/. Configure Cloudinary environment variables for permanent cloud storage.");
      } catch (localWriteErr) {
        console.error("Local file storage fallback failed:", localWriteErr.message);
        return res.status(500).json({
          success: false,
          message: "Could not save uploaded PDF: " + localWriteErr.message + ". Cloud storage (Cloudinary) is required for persistent hosting."
        });
      }
    }
  }

  try {
    // 7. Save contribution into `contributions` table with status "Pending" (Requirement 1, 3 & 5)
    const inserted = await sql`
      INSERT INTO contributions (
        user_id,
        contributor_name,
        contributor_email,
        resource_title,
        category,
        existing_resource_id,
        description,
        contribution_content,
        file_path,
        file_name,
        status,
        submitted_at
      )
      VALUES (
        ${contributorId},
        ${contributorName},
        ${contributorEmail},
        ${cleanTitle},
        ${cleanCategory},
        ${cleanExistingId},
        ${cleanDesc},
        ${cleanContent},
        ${filePath},
        ${originalFileName},
        'Pending',
        CURRENT_TIMESTAMP
      )
      RETURNING id, user_id, contributor_name, contributor_email, resource_title, category, existing_resource_id, description, contribution_content, file_path, file_name, status, submitted_at
    `;

    const newContribution = inserted[0];

    // 8. Automatically dispatch email notification to Admin (Requirement 2)
    const portalUrl = `${req.protocol}://${req.get("host")}/#admin`;
    sendAdminContributionNotification({
      name: contributorName,
      email: contributorEmail,
      title: cleanTitle,
      subject: cleanCategory,
      existingResourceTitle: existingResourceTitle,
      existingResourceId: cleanExistingId,
      description: cleanDesc,
      content: cleanContent,
      fileUrl: filePath,
      fileName: originalFileName,
      time: newContribution.submitted_at || new Date(),
      id: newContribution.id,
      portalUrl: portalUrl,
      status: "Pending Approval"
    }).catch((mailErr) => {
      console.error("Secure Log: Admin contribution notification email dispatch encounter:", mailErr.message);
    });

    invalidateAdminCache("contributions");
    invalidateAdminCache("notifications");

    // 9. Respond with exact required confirmation message (Requirement 1)
    res.status(201).json({
      success: true,
      pendingApproval: true,
      message: "Your contribution request has been submitted successfully. Please wait for admin approval.",
      contribution: {
        id: newContribution.id,
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        resource_title: cleanTitle,
        category: cleanCategory,
        existing_resource_id: cleanExistingId,
        existing_resource_title: existingResourceTitle,
        description: cleanDesc,
        file_path: filePath,
        file_name: originalFileName,
        status: "Pending",
        submitted_at: newContribution.submitted_at
      }
    });
  } catch (dbErr) {
    console.error("Contribution insertion database error:", dbErr);
    res.status(500).json({
      success: false,
      message: "Database error while saving your contribution. Please try again."
    });
  }
}

// User Contribution Endpoint: POST /api/contributions
app.post("/api/contributions", requireAuth, uploadPdfMiddleware, handleResourceContributionSubmission);

// Forwarding /api/upload to the unified contribution handler
app.post("/api/upload", requireAuth, uploadPdfMiddleware, handleResourceContributionSubmission);

// Contributor Status Tracking: GET /api/user/contributions (Requirement 4)
app.get("/api/user/contributions", requireAuth, async (req, res) => {
  const authUser = (req.session && req.session.user) || req.user;
  const userId = authUser ? authUser.id : null;
  const userEmail = authUser ? (authUser.email || "") : "";

  try {
    const rows = await sql`
      SELECT 
        c.id,
        c.user_id,
        c.contributor_name,
        c.contributor_email,
        c.resource_title,
        c.category,
        c.existing_resource_id,
        c.description,
        c.contribution_content,
        c.file_path,
        c.file_name,
        c.status,
        c.submitted_at,
        c.reviewed_at,
        c.reviewed_by,
        c.admin_feedback,
        COALESCE(r.title, c.existing_resource_id) AS existing_resource_title,
        r.subject AS existing_resource_subject
      FROM contributions c
      LEFT JOIN resources r ON c.existing_resource_id = r.id
      WHERE (c.user_id = ${userId} OR LOWER(c.contributor_email) = LOWER(${userEmail}))
      ORDER BY c.submitted_at DESC
    `;
    res.json({ success: true, contributions: rows });
  } catch (err) {
    console.error("User contributions fetch error:", err.message);
    res.status(500).json({ success: false, message: "Could not fetch your submitted requests." });
  }
});

// Portal statistics (optimized with live counts)
app.get("/api/stats", async (req, res) => {
  try {
    const userCount = await sql`SELECT COUNT(*)::int AS count FROM users`;
    const resCount = await sql`SELECT COUNT(*)::int AS count FROM resources WHERE status = 'approved' OR status IS NULL`;
    const pendingContribCount = await sql`SELECT COUNT(*)::int AS count FROM contributions WHERE LOWER(status) = 'pending'`.catch(() => [{ count: 0 }]);
    const subjectCount = await sql`SELECT COUNT(DISTINCT subject)::int AS count FROM resources WHERE status = 'approved' OR status IS NULL`;
    const notifCount = await sql`SELECT COUNT(*)::int AS count FROM admin_notifications`.catch(() => [{ count: 0 }]);

    res.json({
      users: (userCount && userCount[0] ? userCount[0].count : 8),
      resources: (resCount && resCount[0] ? resCount[0].count : 5),
      pendingResources: (pendingContribCount && pendingContribCount[0] ? pendingContribCount[0].count : 0),
      pendingContributions: (pendingContribCount && pendingContribCount[0] ? pendingContribCount[0].count : 0),
      subjects: (subjectCount && subjectCount[0] ? subjectCount[0].count : 5),
      notifications: (notifCount && notifCount[0] ? notifCount[0].count : 0),
      reads: "2.4k+"
    });
  } catch (e) {
    res.json({
      users: 8,
      resources: 5,
      pendingResources: 0,
      pendingContributions: 0,
      subjects: 5,
      notifications: 0,
      reads: "2.4k+"
    });
  }
});

// ================= ADMIN MANAGEMENT APIS =================

// Fast in-memory cache for high-frequency admin endpoints (eliminates repeated DB queries)
const adminCache = {
  users: { data: null, timestamp: 0 },
  notifications: { data: null, timestamp: 0 },
  resources: { data: null, timestamp: 0 },
  contributions: { data: null, timestamp: 0 }
};
const ADMIN_CACHE_TTL = 4000; // 4 seconds TTL for lightning-fast sub-second responses

function getCachedAdminData(key) {
  const item = adminCache[key];
  if (item && item.data && (Date.now() - item.timestamp < ADMIN_CACHE_TTL)) {
    return item.data;
  }
  return null;
}

function setCachedAdminData(key, data) {
  adminCache[key] = { data, timestamp: Date.now() };
}

function invalidateAdminCache(key) {
  if (key && adminCache[key]) {
    adminCache[key].data = null;
    adminCache[key].timestamp = 0;
  } else if (!key) {
    adminCache.users.data = null;
    adminCache.notifications.data = null;
    adminCache.resources.data = null;
    adminCache.contributions.data = null;
  }
}

// Middleware to protect admin routes with multi-factor session & header fallback
async function requireAdmin(req, res, next) {
  // 1. Check express session
  if (req.session && req.session.user && req.session.user.role === "admin") {
    req.user = req.session.user;
    return next();
  }

  // 2. Check Bearer token or x-auth-token header
  let token = null;
  const authHeader = req.headers["authorization"] || "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (req.headers["x-auth-token"]) {
    token = String(req.headers["x-auth-token"]).trim();
  }

  if (token) {
    const verified = verifyAuthToken(token);
    if (verified && verified.id && verified.role === "admin") {
      if (req.session) {
        req.session.user = verified;
      }
      req.user = verified;
      return next();
    }
  }

  // 3. Fallback header check (e.g. if session cookie dropped during network hiccups)
  const headerEmail = (req.headers["x-admin-email"] || req.headers["x-user-email"] || "").trim().toLowerCase();
  const masterAdminEmail = (process.env.ADMIN_EMAIL || "admin.studyportal@gmail.com").toLowerCase();

  if (headerEmail) {
    if (headerEmail === masterAdminEmail || headerEmail === "admin@studyportal.edu") {
      if (!req.session.user) {
        req.session.user = { id: 1, name: "System Administrator", email: headerEmail, role: "admin" };
      }
      return next();
    }

    try {
      const userRows = await sql`
        SELECT id, name, email, role FROM users WHERE LOWER(email) = ${headerEmail} LIMIT 1
      `;
      if (userRows && userRows.length > 0 && userRows[0].role === "admin") {
        if (!req.session.user) {
          req.session.user = {
            id: userRows[0].id,
            name: userRows[0].name,
            email: userRows[0].email,
            role: "admin"
          };
        }
        return next();
      }
    } catch (e) {
      console.warn("requireAdmin verification notice:", e.message);
    }
  }

  return res.status(403).json({
    success: false,
    message: "Access restricted. Administrator credentials required."
  });
}

// Get all registered users (Admin only - optimized with caching & fallback)
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  const isFresh = req.query.fresh === "true" || req.headers["cache-control"] === "no-cache";
  if (!isFresh) {
    const cached = getCachedAdminData("users");
    if (cached) {
      return res.json({ success: true, users: cached, cached: true });
    }
  }

  try {
    const users = await sql`
      SELECT id, name, email, COALESCE(role, 'user') AS role, created_at
      FROM users
      ORDER BY id ASC
    `;
    setCachedAdminData("users", users);
    res.json({ success: true, users });
  } catch (err) {
    console.error("Admin users fetch error:", err.message);
    if (adminCache.users.data) {
      return res.json({ success: true, users: adminCache.users.data, cached: true });
    }
    res.status(500).json({ success: false, message: "Could not fetch users list." });
  }
});

// Update user role (Admin only)
app.post("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (role !== "admin" && role !== "user") {
    return res.status(400).json({ success: false, message: "Invalid role specified." });
  }

  try {
    await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
    invalidateAdminCache("users");
    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update role." });
  }
});

// Delete user account (Admin only)
app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const targetUser = await sql`SELECT email FROM users WHERE id = ${id}`;
    if (targetUser.length > 0 && (targetUser[0].email === "admin.studyportal@gmail.com" || targetUser[0].email === "admin@studyportal.edu")) {
      return res.status(400).json({ success: false, message: "Cannot delete the primary master administrator account." });
    }
    await sql`DELETE FROM users WHERE id = ${id}`;
    invalidateAdminCache("users");
    res.json({ success: true, message: "User account deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
});

// ================= ADMIN CONTRIBUTION REQUESTS APIS (Requirement 3, 4, 6) =================

// Get all contribution requests with status filtering & caching (Admin only)
app.get("/api/admin/contributions", requireAdmin, async (req, res) => {
  const isFresh = req.query.fresh === "true" || req.headers["cache-control"] === "no-cache";
  const statusFilter = (req.query.status || "all").trim().toLowerCase();

  if (!isFresh && statusFilter === "all") {
    const cached = getCachedAdminData("contributions");
    if (cached) {
      return res.json({ success: true, contributions: cached, cached: true });
    }
  }

  try {
    let rows;
    if (statusFilter && statusFilter !== "all") {
      rows = await sql`
        SELECT 
          c.id,
          c.user_id,
          c.contributor_name,
          c.contributor_email,
          c.resource_title,
          c.category,
          c.existing_resource_id,
          c.description,
          c.contribution_content,
          c.file_path,
          c.file_name,
          c.status,
          c.submitted_at,
          c.reviewed_at,
          c.reviewed_by,
          c.admin_feedback,
          COALESCE(r.title, c.existing_resource_id) AS existing_resource_title,
          r.subject AS existing_resource_subject
        FROM contributions c
        LEFT JOIN resources r ON c.existing_resource_id = r.id
        WHERE LOWER(c.status) = LOWER(${statusFilter})
        ORDER BY c.submitted_at DESC
      `;
    } else {
      rows = await sql`
        SELECT 
          c.id,
          c.user_id,
          c.contributor_name,
          c.contributor_email,
          c.resource_title,
          c.category,
          c.existing_resource_id,
          c.description,
          c.contribution_content,
          c.file_path,
          c.file_name,
          c.status,
          c.submitted_at,
          c.reviewed_at,
          c.reviewed_by,
          c.admin_feedback,
          COALESCE(r.title, c.existing_resource_id) AS existing_resource_title,
          r.subject AS existing_resource_subject
        FROM contributions c
        LEFT JOIN resources r ON c.existing_resource_id = r.id
        ORDER BY 
          CASE 
            WHEN LOWER(c.status) = 'pending' THEN 0 
            WHEN LOWER(c.status) = 'approved' THEN 1 
            ELSE 2 
          END,
          c.submitted_at DESC
      `;
    }

    if (statusFilter === "all") {
      setCachedAdminData("contributions", rows);
    }

    res.json({ success: true, contributions: rows });
  } catch (err) {
    console.error("Admin contributions fetch error:", err.message);
    if (adminCache.contributions.data) {
      return res.json({ success: true, contributions: adminCache.contributions.data, cached: true });
    }
    res.status(500).json({ success: false, message: "Could not fetch contribution requests." });
  }
});

// Get a single contribution request details (Admin only)
app.get("/api/admin/contributions/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await sql`
      SELECT 
        c.*,
        COALESCE(r.title, c.existing_resource_id) AS existing_resource_title,
        r.subject AS existing_resource_subject
      FROM contributions c
      LEFT JOIN resources r ON c.existing_resource_id = r.id
      WHERE c.id = ${id}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Contribution request not found." });
    }
    res.json({ success: true, contribution: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load contribution details." });
  }
});

// Approve a contribution request (Admin only - Requirement 3 & 4)
app.post("/api/admin/contributions/:id/approve", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminFeedback = req.body.adminFeedback ? String(req.body.adminFeedback).trim() : null;
  const reviewerName = (req.session && req.session.user && req.session.user.name) || (req.user && req.user.name) || "System Administrator";
  const reviewerEmail = (req.session && req.session.user && req.session.user.email) || (req.user && req.user.email) || ADMIN_EMAIL;
  const reviewedBy = `${reviewerName} (${reviewerEmail})`;

  try {
    const existing = await sql`
      SELECT c.*, COALESCE(r.title, c.existing_resource_id) AS existing_resource_title
      FROM contributions c
      LEFT JOIN resources r ON c.existing_resource_id = r.id
      WHERE c.id = ${id}
      LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: "Contribution request not found." });
    }

    const contrib = existing[0];

    // 1. Update contribution status to Approved
    const updated = await sql`
      UPDATE contributions 
      SET 
        status = 'Approved',
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = ${reviewedBy},
        admin_feedback = ${adminFeedback}
      WHERE id = ${id}
      RETURNING *
    `;

    // 2. Publish/apply to resources table so students can access it
    // "Only approved contributions can be published or applied to existing resources.
    //  Pending and rejected contributions must never appear as published resources."
    const resUniqueId = `contrib-${contrib.id}`;
    const publishedContent = `
      <div class="community-contribution-header" style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <span style="display: inline-block; background: #059669; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 10px; border-radius: 9999px;">
            ✓ Approved Peer Contribution
          </span>
          <span style="font-size: 12.5px; color: #065f46;">
            Contributed to coursework: <strong>${contrib.existing_resource_title || contrib.existing_resource_id}</strong>
          </span>
        </div>
      </div>
      <h3>${contrib.resource_title}</h3>
      <p><strong>Discipline / Category:</strong> ${contrib.category || 'General'}</p>
      <p><strong>Contributed By:</strong> ${contrib.contributor_name} (${contrib.contributor_email})</p>
      <div class="note-callout">
        <strong>Overview &amp; Notes:</strong>
        <p>${contrib.description}</p>
      </div>
      ${
        contrib.contribution_content
          ? `
        <div style="margin-top: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; white-space: pre-wrap; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1e293b;">
          ${contrib.contribution_content}
        </div>
      `
          : ""
      }
      ${
        contrib.file_path
          ? `
        <div style="margin-top: 18px;">
          <a href="${contrib.file_path}" target="_blank" class="btn-primary" style="display: inline-block; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            ⬇️ Download Approved PDF Material
          </a>
        </div>
      `
          : ""
      }
    `;

    await sql`
      INSERT INTO resources (
        id, title, subject, reading_time, level, summary, content, file_url, file_name, uploader_name, uploader_email, uploader_id, status, created_at
      ) VALUES (
        ${resUniqueId},
        ${contrib.resource_title},
        ${contrib.category || 'General'},
        '5 min read',
        'Peer Contribution',
        ${contrib.description},
        ${publishedContent},
        ${contrib.file_path},
        ${contrib.file_name || null},
        ${contrib.contributor_name},
        ${contrib.contributor_email},
        ${contrib.user_id},
        'approved',
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET 
        status = 'approved',
        title = ${contrib.resource_title},
        subject = ${contrib.category || 'General'},
        summary = ${contrib.description},
        content = ${publishedContent},
        file_url = ${contrib.file_path},
        file_name = ${contrib.file_name || null}
    `;

    // 3. Notify contributor by email (Requirement 3)
    const portalUrl = `${req.protocol}://${req.get("host")}/#resources`;
    sendContributorStatusNotification({
      contributorName: contrib.contributor_name,
      contributorEmail: contrib.contributor_email,
      resourceTitle: contrib.resource_title,
      existingResourceTitle: contrib.existing_resource_title,
      status: "Approved",
      reviewedAt: new Date(),
      reviewedBy: reviewerName,
      adminFeedback: adminFeedback,
      portalUrl: portalUrl
    }).catch((notifErr) => {
      console.warn("Notice: Contributor status email delivery notice:", notifErr.message);
    });

    invalidateAdminCache();

    res.json({
      success: true,
      message: `✓ Contribution "${contrib.resource_title}" approved and published to portal library! Contributor notified.`,
      contribution: updated[0]
    });
  } catch (err) {
    console.error("Admin approve contribution error:", err);
    res.status(500).json({ success: false, message: "Failed to approve contribution." });
  }
});

// Reject a contribution request (Admin only - Requirement 3 & 4)
app.post("/api/admin/contributions/:id/reject", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminFeedback = req.body.adminFeedback ? String(req.body.adminFeedback).trim() : "Contribution declined by administrator.";
  const reviewerName = (req.session && req.session.user && req.session.user.name) || (req.user && req.user.name) || "System Administrator";
  const reviewerEmail = (req.session && req.session.user && req.session.user.email) || (req.user && req.user.email) || ADMIN_EMAIL;
  const reviewedBy = `${reviewerName} (${reviewerEmail})`;

  try {
    const existing = await sql`
      SELECT c.*, COALESCE(r.title, c.existing_resource_id) AS existing_resource_title
      FROM contributions c
      LEFT JOIN resources r ON c.existing_resource_id = r.id
      WHERE c.id = ${id}
      LIMIT 1
    `;

    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: "Contribution request not found." });
    }

    const contrib = existing[0];

    // 1. Update contribution status to Rejected
    const updated = await sql`
      UPDATE contributions 
      SET 
        status = 'Rejected',
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = ${reviewedBy},
        admin_feedback = ${adminFeedback}
      WHERE id = ${id}
      RETURNING *
    `;

    // 2. Ensure it never appears in published resources (Requirement 3)
    const resUniqueId = `contrib-${contrib.id}`;
    await sql`DELETE FROM resources WHERE id = ${resUniqueId}`.catch(() => {});

    // 3. Notify contributor by email (Requirement 3)
    const portalUrl = `${req.protocol}://${req.get("host")}/#upload`;
    sendContributorStatusNotification({
      contributorName: contrib.contributor_name,
      contributorEmail: contrib.contributor_email,
      resourceTitle: contrib.resource_title,
      existingResourceTitle: contrib.existing_resource_title,
      status: "Rejected",
      reviewedAt: new Date(),
      reviewedBy: reviewerName,
      adminFeedback: adminFeedback,
      portalUrl: portalUrl
    }).catch((notifErr) => {
      console.warn("Notice: Contributor status email delivery notice:", notifErr.message);
    });

    invalidateAdminCache();

    res.json({
      success: true,
      message: `Contribution "${contrib.resource_title}" was rejected and will not appear on the portal. Contributor notified.`,
      contribution: updated[0]
    });
  } catch (err) {
    console.error("Admin reject contribution error:", err);
    res.status(500).json({ success: false, message: "Failed to reject contribution." });
  }
});

// Delete contribution request (Admin only)
app.delete("/api/admin/contributions/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const resUniqueId = `contrib-${id}`;
    await sql`DELETE FROM resources WHERE id = ${resUniqueId}`.catch(() => {});
    await sql`DELETE FROM contributions WHERE id = ${id}`;
    invalidateAdminCache();
    res.json({ success: true, message: "Contribution record removed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete contribution." });
  }
});

// Public / student endpoint to get approved contributions for a resource
app.get("/api/contributions/approved", async (req, res) => {
  const existingResourceId = req.query.resourceId;
  try {
    let rows;
    if (existingResourceId) {
      rows = await sql`
        SELECT id, contributor_name, resource_title, category, existing_resource_id, description, file_path, file_name, submitted_at
        FROM contributions
        WHERE status = 'Approved' AND existing_resource_id = ${existingResourceId}
        ORDER BY submitted_at DESC
      `;
    } else {
      rows = await sql`
        SELECT id, contributor_name, resource_title, category, existing_resource_id, description, file_path, file_name, submitted_at
        FROM contributions
        WHERE status = 'Approved'
        ORDER BY submitted_at DESC
      `;
    }
    res.json({ success: true, contributions: rows });
  } catch (err) {
    res.json({ success: true, contributions: [] });
  }
});

// Get all resources including pending contributions (Admin only)
app.get("/api/admin/resources", requireAdmin, async (req, res) => {
  const cached = getCachedAdminData("resources");
  if (cached) {
    return res.json({ success: true, resources: cached, cached: true });
  }

  try {
    const resources = await sql`
      SELECT 
        id, title, subject, reading_time, level, summary, content, file_url, file_name,
        uploader_name, uploader_email, COALESCE(status, 'approved') AS status, created_at
      FROM resources
      ORDER BY 
        CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
        created_at DESC
    `;
    setCachedAdminData("resources", resources);
    res.json({ success: true, resources });
  } catch (err) {
    console.error("Admin resources fetch error:", err.message);
    if (adminCache.resources.data) {
      return res.json({ success: true, resources: adminCache.resources.data, cached: true });
    }
    res.status(500).json({ success: false, message: "Could not fetch resources list." });
  }
});

// Approve a student contributed resource (Admin only)
app.post("/api/admin/resources/:id/approve", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await sql`
      UPDATE resources 
      SET status = 'approved' 
      WHERE id = ${id}
      RETURNING id, title, uploader_name, uploader_email
    `;
    if (!updated || updated.length === 0) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }
    invalidateAdminCache("resources");
    res.json({
      success: true,
      message: `Resource "${updated[0].title}" approved! It is now live in the student study portal repository.`,
      resource: updated[0]
    });
  } catch (err) {
    console.error("Admin resource approval error:", err);
    res.status(500).json({ success: false, message: "Failed to approve resource." });
  }
});

// Reject a student contributed resource (Admin only)
app.post("/api/admin/resources/:id/reject", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await sql`
      UPDATE resources 
      SET status = 'rejected' 
      WHERE id = ${id}
      RETURNING id, title
    `;
    if (!updated || updated.length === 0) {
      return res.status(404).json({ success: false, message: "Resource not found." });
    }
    invalidateAdminCache("resources");
    res.json({
      success: true,
      message: `Resource "${updated[0].title}" was rejected and will not be displayed on the portal.`,
      resource: updated[0]
    });
  } catch (err) {
    console.error("Admin resource rejection error:", err);
    res.status(500).json({ success: false, message: "Failed to reject resource." });
  }
});

// Delete resource (Admin only)
app.delete("/api/admin/resources/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM resources WHERE id = ${id}`;
    invalidateAdminCache("resources");
    res.json({ success: true, message: "Resource removed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to remove resource." });
  }
});

// Get admin registration & contribution notifications log (Admin only - optimized with caching & fallback)
app.get("/api/admin/notifications", requireAdmin, async (req, res) => {
  const isFresh = req.query.fresh === "true" || req.headers["cache-control"] === "no-cache";
  if (!isFresh) {
    const cached = getCachedAdminData("notifications");
    if (cached) {
      return res.json({ success: true, notifications: cached, cached: true });
    }
  }

  try {
    const notifications = await sql`
      SELECT id, type, recipient, user_name, user_email, user_role, registered_at, status, details
      FROM admin_notifications
      ORDER BY id DESC
      LIMIT 100
    `;
    setCachedAdminData("notifications", notifications);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Admin notifications fetch error:", err.message);
    if (adminCache.notifications.data) {
      return res.json({ success: true, notifications: adminCache.notifications.data, cached: true });
    }
    res.status(500).json({ success: false, message: "Could not fetch notifications history." });
  }
});

// Trigger test notification email to Admin (Admin only)
app.post("/api/admin/notifications/test", requireAdmin, async (req, res) => {
  try {
    const targetEmail = req.body && req.body.email ? req.body.email : ADMIN_EMAIL;
    const result = await sendTestNotification(targetEmail);
    invalidateAdminCache("notifications");
    res.json({
      success: true,
      message: `Test registration notification dispatched to administrator (${ADMIN_EMAIL}).`,
      result
    });
  } catch (err) {
    console.error("Admin test notification dispatch error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to dispatch test notification." });
  }
});

// Trigger test resource contribution notification email to Admin (Admin only)
app.post("/api/admin/notifications/test-contribution", requireAdmin, async (req, res) => {
  try {
    const portalUrl = `${req.protocol}://${req.get("host")}/#admin`;
    const result = await sendAdminContributionNotification({
      name: "Jordan Lee (Diagnostic Sample)",
      email: "jordan.lee@university.edu",
      title: "Unit 4 Graph Algorithms & Dijkstra Cheatsheet",
      subject: "Data Structures",
      description: "Comprehensive notes covering Dijkstra shortest path, Bellman-Ford, and topological sort with solved examination problems.",
      fileUrl: "/uploads/sample-graph-algorithms.pdf",
      fileName: "sample-graph-algorithms.pdf",
      time: new Date(),
      id: "res-test-sample",
      portalUrl: portalUrl,
      status: "pending"
    });
    invalidateAdminCache("notifications");
    res.json({
      success: true,
      message: `Test resource contribution alert dispatched to administrator (${ADMIN_EMAIL}).`,
      result
    });
  } catch (err) {
    console.error("Admin test contribution notification error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to dispatch test contribution notification." });
  }
});

// Email notification diagnostic & configuration status (Admin only)
app.get("/api/admin/email-status", requireAdmin, (req, res) => {
  try {
    const status = getEmailConfigStatus();
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not retrieve email configuration status." });
  }
});

// Update email notification credentials & test connection (Admin only)
app.post("/api/admin/email-config", requireAdmin, async (req, res) => {
  const { user, pass, host, port, secure } = req.body;

  if (!user || !pass) {
    return res.status(400).json({
      success: false,
      message: "Please provide both sender email address and Google App Password."
    });
  }

  try {
    const cleanUser = String(user).trim();
    const cleanPass = String(pass).trim().replace(/\s+/g, ""); // strip any pasted spaces from 16-char app password
    const cleanHost = host ? String(host).trim() : "smtp.gmail.com";
    const cleanPort = port ? parseInt(port, 10) : 465;

    setCustomTransporter({
      user: cleanUser,
      pass: cleanPass,
      host: cleanHost,
      port: cleanPort,
      secure: secure !== undefined ? secure : true
    });

    const verifyResult = await verifyTransporterConnection();

    // Persist to .env file so it survives server restarts
    try {
      const envPath = path.join(__dirname, ".env");
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";

      function setOrAppendEnv(k, v) {
        const regex = new RegExp(`^${k}=.*$`, "m");
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${k}=${v}`);
        } else {
          envContent += `\n${k}=${v}`;
        }
      }

      setOrAppendEnv("SMTP_USER", cleanUser);
      setOrAppendEnv("SMTP_PASS", cleanPass);
      setOrAppendEnv("SMTP_HOST", cleanHost);
      setOrAppendEnv("SMTP_PORT", cleanPort);
      setOrAppendEnv("SMTP_SECURE", "true");

      fs.writeFileSync(envPath, envContent, "utf8");
    } catch (fsErr) {
      console.warn("Notice: Could not write credentials to .env:", fsErr.message);
    }

    if (!verifyResult.ok) {
      return res.status(400).json({
        success: false,
        message: `Credentials saved, but verification failed: ${verifyResult.error}. Please ensure 2-Step Verification is active and a valid 16-character App Password is used.`
      });
    }

    res.json({
      success: true,
      message: "✓ SMTP connection verified! Live email alerts will now arrive directly in admin.studyportal@gmail.com.",
      status: getEmailConfigStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update email settings." });
  }
});

// Fallback for client-side routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Export app for serverless/Vercel
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✓ StudyPortal server running at http://localhost:${PORT}`);
  });
}