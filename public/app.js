// ================= STUDY NOTES DATABASE =================

const STUDY_NOTES_DB = {
    "c-basics": {
        id: "c-basics",
        title: "💻 C Programming Basics - Complete Course Notes",
        subject: "C Programming",
        readingTime: "7 min read",
        level: "Beginner",
        summary: "Core foundations of C programming: compilation model, basic data types, control flow structures, functions, pointers, and memory management.",
        content: `
            <h3>1. Introduction to C Language</h3>
            <p>C is a procedural, general-purpose programming language developed by Dennis Ritchie in 1972 at Bell Labs. It serves as the foundation for modern operating systems, compilers, and em[...]

            <div class="note-callout">
                <strong>💡 Core Features:</strong> Structured language, highly portable, direct memory manipulation via pointers, fast execution speed, and rich set of operators.
            </div>

            <h3>2. Program Structure & Execution</h3>
            <p>Every C program begins execution in the <code>main()</code> function. The standard compilation phases are:</p>
            <ol>
                <li><strong>Preprocessing:</strong> Resolves <code>#include</code> and <code>#define</code> macros.</li>
                <li><strong>Compilation:</strong> Translates C code into assembly instructions.</li>
                <li><strong>Assembly:</strong> Converts assembly instructions into machine code (object file <code>.o</code> / <code>.obj</code>).</li>
                <li><strong>Linking:</strong> Links object files with system libraries into an executable (<code>.exe</code> or binary).</li>
            </ol>

            <h3>3. Fundamental Data Types</h3>
            <table class="notes-table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Typical Size</th>
                        <th>Format Specifier</th>
                        <th>Example Range / Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><code>int</code></td>
                        <td>4 bytes</td>
                        <td><code>%d</code> or <code>%i</code></td>
                        <td>-2,147,483,648 to 2,147,483,647</td>
                    </tr>
                    <tr>
                        <td><code>float</code></td>
                        <td>4 bytes</td>
                        <td><code>%f</code></td>
                        <td>3.14159f (6 decimal places)</td>
                    </tr>
                    <tr>
                        <td><code>double</code></td>
                        <td>8 bytes</td>
                        <td><code>%lf</code></td>
                        <td>3.1415926535 (15 decimal places)</td>
                    </tr>
                    <tr>
                        <td><code>char</code></td>
                        <td>1 byte</td>
                        <td><code>%c</code></td>
                        <td>'A', 'z', ASCII 0 - 255</td>
                    </tr>
                </tbody>
            </table>

            <h3>4. Control Flow & Loops</h3>
            <p>C provides structured decision making and repetition constructs:</p>
            <ul>
                <li><strong>Conditionals:</strong> <code>if</code>, <code>else if</code>, <code>else</code>, and <code>switch-case</code> for multi-branch branching.</li>
                <li><strong>Iterative Loops:</strong> <code>for</code> (definite iteration), <code>while</code> (entry-controlled), and <code>do-while</code> (exit-controlled, executes at least on[...]
                <li><strong>Jump Statements:</strong> <code>break</code> (exit loop/switch), <code>continue</code> (skip current iteration), and <code>return</code> (exit function).</li>
            </ul>

            <h3>5. Pointers & Memory Management</h3>
            <p>A <strong>pointer</strong> is a variable that stores the memory address of another variable.</p>
            <ul>
                <li><code>&amp;</code> (Address-of operator): Retrieves variable's memory address.</li>
                <li><code>*</code> (Dereference operator): Accesses value stored at the memory address pointed to.</li>
                <li><strong>Dynamic Allocation:</strong> <code>malloc()</code>, <code>calloc()</code>, <code>realloc()</code>, and <code>free()</code> from <code>&lt;stdlib.h&gt;</code>.</li>
            </ul>

            <div class="code-block">
                <div class="code-header">
                    <span>c_pointers_example.c</span>
                    <button class="copy-code-btn" onclick="copyCodeSnippet(this)">Copy Code</button>
                </div>
                <pre><code>#include &lt;stdio.h&gt;
#include &lt;stdlib.h&gt;

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    printf("Before swap: x = %d, y = %d\\n", x, y);

    // Pass addresses to swap function
    swap(&amp;x, &amp;y);
    printf("After swap:  x = %d, y = %d\\n", x, y);

    // Dynamic array allocation
    int *arr = (int *)malloc(5 * sizeof(int));
    if (arr != NULL) {
        for (int i = 0; i &lt; 5; i++) {
            arr[i] = (i + 1) * 10;
            printf("arr[%d] = %d\\n", i, arr[i]);
        }
        free(arr); // Always free allocated memory!
    }

    return 0;
}</code></pre>
            </div>

            <h3>6. Quick Exam & Interview Takeaways</h3>
            <div class="note-callout">
                <strong>⚠️ Beware of:</strong>
                <ul>
                    <li>Dangling pointers (referencing freed memory).</li>
                    <li>Memory leaks (forgetting to call <code>free()</code>).</li>
                    <li>Array index out-of-bounds (C does not perform bounds checking!).</li>
                </ul>
            </div>
        `
    },

    "web-dev": {
        id: "web-dev",
        title: "🌐 HTML5 & Modern CSS - Web Development Notes",
        subject: "Web Development",
        readingTime: "8 min read",
        level: "Beginner to Intermediate",
        summary: "Comprehensive guide to HTML5 semantic structure, modern CSS styling, the Box Model, Flexbox, Grid layout systems, and responsive design media queries.",
        content: `
            <h3>1. Semantic HTML5 Architecture</h3>
            <p>Semantic markup provides clear meaning to both browsers and search engines, improving accessibility (a11y) and SEO ranking.</p>
            <ul>
                <li><code>&lt;header&gt;</code>: Introductory content, branding, or navigational links.</li>
                <li><code>&lt;nav&gt;</code>: Major navigational blocks.</li>
                <li><code>&lt;main&gt;</code>: Dominant, unique content of the document body.</li>
                <li><code>&lt;article&gt;</code>: Self-contained, independently distributable composition.</li>
                <li><code>&lt;section&gt;</code>: Thematic grouping of content with a heading.</li>
                <li><code>&lt;aside&gt;</code>: Content tangentially related to surrounding content (sidebars, callouts).</li>
                <li><code>&lt;footer&gt;</code>: Authorship, copyright, and contact information.</li>
            </ul>

            <h3>2. The CSS Box Model</h3>
            <p>Every element in a web page is rendered as a rectangular box consisting of four layers:</p>
            <ol>
                <li><strong>Content:</strong> Text, images, or child elements.</li>
                <li><strong>Padding:</strong> Transparent spacing between content and border.</li>
                <li><strong>Border:</strong> Line surrounding the padding and content.</li>
                <li><strong>Margin:</strong> Space separating the element from neighboring elements.</li>
            </ol>

            <div class="note-callout">
                <strong>💡 Modern Standard:</strong> Always set <code>* { box-sizing: border-box; }</code> so padding and border are included in the element's total calculated width and height!
            </div>

            <h3>3. Flexbox vs. CSS Grid Cheatsheet</h3>
            <table class="notes-table">
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th>Flexbox (1-Dimensional)</th>
                        <th>CSS Grid (2-Dimensional)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Primary Use</strong></td>
                        <td>Components, navbars, rows or columns</td>
                        <td>Overall page layouts, photo galleries, dashboards</td>
                    </tr>
                    <tr>
                        <td><strong>Key Parent Properties</strong></td>
                        <td><code>display: flex</code>, <code>justify-content</code>, <code>align-items</code>, <code>gap</code></td>
                        <td><code>display: grid</code>, <code>grid-template-columns</code>, <code>grid-template-rows</code></td>
                    </tr>
                    <tr>
                        <td><strong>Item Control</strong></td>
                        <td><code>flex-grow</code>, <code>flex-shrink</code>, <code>flex-basis</code></td>
                        <td><code>grid-column: span 2</code>, <code>grid-row</code></td>
                    </tr>
                </tbody>
            </table>

            <h3>4. Modern Responsive CSS Component Example</h3>
            <div class="code-block">
                <div class="code-header">
                    <span>styles.css</span>
                    <button class="copy-code-btn" onclick="copyCodeSnippet(this)">Copy Code</button>
                </div>
                <pre><code>/* Responsive Card Grid with CSS Grid */
.cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 20px;
}

/* Glassmorphism Card Style */
.study-card {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.study-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

/* Mobile Media Query */
@media (max-width: 640px) {
    .cards-container {
        grid-template-columns: 1fr;
        padding: 12px;
    }
}</code></pre>
            </div>

            <h3>5. Key Exam & Production Tips</h3>
            <ul>
                <li>Use REM/EM units for typography and spacing for better accessibility and zoom scalability.</li>
                <li>Always supply descriptive <code>alt</code> text on <code>&lt;img&gt;</code> tags for screen readers.</li>
                <li>Leverage CSS custom properties (variables) like <code>--primary-color: #2563eb;</code> for design system maintainability.</li>
            </ul>
        `
    },

    "aws-cloud": {
        id: "aws-cloud",
        title: "☁️ AWS Basics - Cloud Computing Revision Guide",
        subject: "Cloud Computing",
        readingTime: "9 min read",
        level: "Intermediate",
        summary: "High-yield revision notes on cloud architectures, service models (IaaS, PaaS, SaaS), AWS core compute, storage, networking, database services, and IAM security.",
        content: `
            <h3>1. Cloud Computing Fundamentals</h3>
            <p>Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing.</p>
            <ul>
                <li><strong>Six Advantages of Cloud:</strong> Trade capital expense for variable expense, benefit from massive economies of scale, stop guessing capacity, increase speed and agili[...]
                <li><strong>Cloud Service Models:</strong>
                    <ul>
                        <li><strong>IaaS (Infrastructure as a Service):</strong> Highest level of control. Example: Amazon EC2, VPC.</li>
                        <li><strong>PaaS (Platform as a Service):</strong> Focus on application code without OS/server management. Example: AWS Elastic Beanstalk.</li>
                        <li><strong>SaaS (Software as a Service):</strong> Complete end-user application. Example: Google Workspace, Microsoft 365.</li>
                    </ul>
                </li>
            </ul>

            <h3>2. AWS Global Infrastructure</h3>
            <table class="notes-table">
                <thead>
                    <tr>
                        <th>Concept</th>
                        <th>Definition</th>
                        <th>Key Characteristics</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Region</strong></td>
                        <td>A physical geographic location around the world</td>
                        <td>Contains 2+ isolated Availability Zones (e.g., us-east-1, ap-south-1).</td>
                    </tr>
                    <tr>
                        <td><strong>Availability Zone (AZ)</strong></td>
                        <td>One or more discrete data centers with redundant power &amp; networking</td>
                        <td>Connected via low-latency private fiber optic networks.</td>
                    </tr>
                    <tr>
                        <td><strong>Edge Locations</strong></td>
                        <td>Endpoints for CloudFront (CDN) caching content closest to users</td>
                        <td>Reduces latency for worldwide end-users.</td>
                    </tr>
                </tbody>
            </table>

            <h3>3. Core AWS Services Quick Reference</h3>
            <ul>
                <li><strong>Compute:</strong>
                    <ul>
                        <li><strong>Amazon EC2 (Elastic Compute Cloud):</strong> Resizable virtual server instances.</li>
                        <li><strong>AWS Lambda:</strong> Serverless compute that runs code in response to events without provisioning servers.</li>
                    </ul>
                </li>
                <li><strong>Storage:</strong>
                    <ul>
                        <li><strong>Amazon S3 (Simple Storage Service):</strong> Highly durable (99.999999999% durability) object storage for files, media, and backups.</li>
                        <li><strong>Amazon EBS (Elastic Block Store):</strong> Persistent block-level storage volumes for EC2 instances.</li>
                    </ul>
                </li>
                <li><strong>Networking:</strong>
                    <ul>
                        <li><strong>Amazon VPC (Virtual Private Cloud):</strong> Logically isolated virtual network to launch AWS resources.</li>
                        <li><strong>Route 53:</strong> Highly available and scalable cloud Domain Name System (DNS) web service.</li>
                    </ul>
                </li>
                <li><strong>Databases:</strong>
                    <ul>
                        <li><strong>Amazon RDS:</strong> Managed relational database (PostgreSQL, MySQL, Oracle, SQL Server).</li>
                        <li><strong>Amazon DynamoDB:</strong> Fully managed NoSQL key-value and document database with single-digit millisecond latency.</li>
                    </ul>
                </li>
            </ul>

            <h3>4. Security & IAM (Identity and Access Management)</h3>
            <div class="note-callout">
                <strong>🔒 Golden Rules of AWS IAM:</strong>
                <ol>
                    <li>Never use the Root user account for everyday tasks.</li>
                    <li>Always enforce <strong>Multi-Factor Authentication (MFA)</strong>.</li>
                    <li>Follow the <strong>Principle of Least Privilege</strong> (grant only minimum necessary permissions).</li>
                    <li>Use <strong>IAM Roles</strong> for AWS services to communicate securely without embedding access keys.</li>
                </ol>
            </div>

            <div class="code-block">
                <div class="code-header">
                    <span>sample-iam-policy.json</span>
                    <button class="copy-code-btn" onclick="copyCodeSnippet(this)">Copy Code</button>
                </div>
                <pre><code>{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::student-portal-notes",
        "arn:aws:s3:::student-portal-notes/*"
      ]
    }
  ]
}</code></pre>
            </div>
        `
    },

    "java-oop": {
        id: "java-oop",
        title: "☕ Java OOP Concepts - Complete Revision Notes",
        subject: "Java",
        readingTime: "8 min read",
        level: "Intermediate",
        summary: "Master Object-Oriented Programming in Java: classes, objects, the four pillars of OOP (encapsulation, inheritance, polymorphism, abstraction), exception handling, and collection[...]",
        content: `
            <h3>1. The 4 Pillars of Object-Oriented Programming</h3>
            <ol>
                <li>
                    <strong>Encapsulation:</strong> Bundling data (variables) and methods that operate on the data into a single unit (class) while restricting direct access using <code>private</
... (file continues unchanged)
// --- Minimal auth flow setup ---
const AUTH_KEYS = {
  registered: 'learnhub_registered',
  loggedIn: 'learnhub_logged_in'
};

function isLoggedIn() {
  return localStorage.getItem(AUTH_KEYS.loggedIn) === 'true';
}

function protectNavigation(pageName) {
  const protectedPages = ['upload', 'admin'];

  if (protectedPages.includes(pageName) && !isLoggedIn()) {
    pageName = 'login';
  }

  return pageName;
}

// Preserve the existing showPage logic but wrap it for auth flow
const originalShowPage = window.showPage;

window.showPage = function(pageName) {
  const safePage = protectNavigation(pageName);

  if (typeof originalShowPage === 'function') {
    return originalShowPage(safePage);
  }

  const allPages = document.querySelectorAll('.page');
  allPages.forEach(page => page.classList.remove('active'));

  const target = document.getElementById(safePage);
  if (target) target.classList.add('active');
};

// Default landing page
document.addEventListener('DOMContentLoaded', function () {
  const justRegistered = localStorage.getItem(AUTH_KEYS.registered) === 'true';
  const loggedIn = isLoggedIn();

  if (loggedIn) {
    window.showPage('home');
    return;
  }

  if (justRegistered) {
    window.showPage('login');
    return;
  }

  window.showPage('register');
});

// ================= REGISTER PAGE FIX =================

document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const passwordInput = document.getElementById("register-password");
    const confirmPasswordInput = document.getElementById("register-confirm-password");
    const registerMessage = document.getElementById("register-message");
    const submitButton = document.getElementById("register-submit-btn");
    const strengthText = document.getElementById("password-strength-text");
    const strengthBar = document.getElementById("password-strength-bar");
    const confirmMessage = document.getElementById("confirm-password-message");

    // Show or hide passwords
    document.querySelectorAll(".password-toggle").forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.getAttribute("data-password-target");
            const input = document.getElementById(targetId);

            if (!input) return;

            const showPassword = input.type === "password";
            input.type = showPassword ? "text" : "password";
            button.textContent = showPassword ? "Hide" : "Show";
            button.setAttribute("aria-pressed", String(showPassword));
            button.setAttribute(
                "aria-label",
                showPassword ? "Hide password" : "Show password"
            );
        });
    });

    if (!registerForm) return;

    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener("input", function () {
            const password = passwordInput.value;
            let strength = 0;

            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;

            const labels = [
                "Use at least 8 characters.",
                "Very weak",
                "Weak",
                "Fair",
                "Good",
                "Strong"
            ];

            if (strengthText) {
                strengthText.textContent = labels[strength];
            }

            if (strengthBar) {
                strengthBar.style.width = (strength * 20) + "%";
            }
        });
    }

    // Confirm password
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", function () {
            const matches = confirmPasswordInput.value === passwordInput.value;

            if (confirmMessage) {
                confirmMessage.textContent = matches
                    ? "Passwords match."
                    : "Passwords do not match.";
            }

            confirmPasswordInput.setCustomValidity(
                matches ? "" : "Passwords do not match."
            );
        });
    }

    // Register account
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (registerMessage) {
            registerMessage.textContent = "";
        }

        if (password.length < 8) {
            if (registerMessage) {
                registerMessage.textContent =
                    "Your password must contain at least 8 characters.";
            }
            return;
        }

        if (password.length > 72) {
            if (registerMessage) {
                registerMessage.textContent =
                    "Your password is too long. Please use at most 72 characters.";
            }
            return;
        }

        if (password !== confirmPassword) {
            if (registerMessage) {
                registerMessage.textContent = "Passwords do not match.";
            }
            return;
        }

        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = "<span>Creating account...</span>";

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Registration failed.");
            }

            if (registerMessage) {
                registerMessage.textContent =
                    "Registration successful! Please sign in.";
            }

            // Mark registration and navigate to Login
            localStorage.setItem("learnhub_registered", "true");
            localStorage.setItem("learnhub_justRegistered", "true");

            setTimeout(function () {
                if (typeof window.showPage === "function") {
                    window.showPage("login");
                }
            }, 1000);

        } catch (error) {
            if (registerMessage) {
                registerMessage.textContent =
                    error.message || "Something went wrong. Please try again.";
            }
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
});
});
