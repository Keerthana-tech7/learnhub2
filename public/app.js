/**
 * STUDYPORTAL PRO - APPLICATION LOGIC & FLOW CONTROLLER
 * High performance client logic for student authentication, Neon DB resources,
 * notes viewer, and AI study assistant.
 */

// Storage Keys
const KEY_REGISTERED = "studyportal_has_registered";
const KEY_LOGGED_IN = "studyportal_is_logged_in";
const KEY_USER_DATA = "studyportal_user_data";
const KEY_LAST_EMAIL = "studyportal_last_email";

// Protected Pages that require authentication
const PROTECTED_PAGES = ["home", "resources", "ai-search", "upload", "admin"];

// State
let allResources = [];
let activeSubjectFilter = "all";
let currentModalResource = null;

// ================= AUTHENTICATION HELPERS =================

function hasUserRegistered() {
  return localStorage.getItem(KEY_REGISTERED) === "true";
}

function markUserAsRegistered(email) {
  localStorage.setItem(KEY_REGISTERED, "true");
  if (email) {
    localStorage.setItem(KEY_LAST_EMAIL, email);
  }
}

function isUserLoggedIn() {
  return sessionStorage.getItem(KEY_LOGGED_IN) === "true";
}

function setLoggedInUser(user) {
  sessionStorage.setItem(KEY_LOGGED_IN, "true");
  sessionStorage.setItem(KEY_USER_DATA, JSON.stringify(user));
  if (user && user.email) {
    markUserAsRegistered(user.email);
  }
  updateNavUI();
}

function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(KEY_USER_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearSessionState() {
  sessionStorage.removeItem(KEY_LOGGED_IN);
  sessionStorage.removeItem(KEY_USER_DATA);
  updateNavUI();
}

function showAuthMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  if (!text) {
    el.textContent = "";
    el.className = "auth-message";
    el.style.display = "none";
    return;
  }
  el.textContent = text;
  el.className = `auth-message ${type}`;
  el.style.display = "block";
}

// ================= NAVIGATION CONTROLLER =================

function updateNavUI() {
  const loggedIn = isUserLoggedIn();
  const user = getCurrentUser();

  const protectedLinks = document.querySelectorAll(".nav-auth-protected");
  const navLogin = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const userCluster = document.getElementById("nav-user-cluster");
  const nameDisplay = document.getElementById("user-name-display");
  const avatarInitial = document.getElementById("user-avatar-initial");

  if (loggedIn && user) {
    // Show protected navigation items
    protectedLinks.forEach((link) => (link.style.display = "inline-flex"));
    if (navLogin) navLogin.style.display = "none";
    if (navRegister) navRegister.style.display = "none";

    // Show user profile pill
    if (userCluster) userCluster.style.display = "inline-flex";
    if (nameDisplay) nameDisplay.textContent = user.name || "Student";
    if (avatarInitial) {
      avatarInitial.textContent = (user.name ? user.name[0] : "S").toUpperCase();
    }

    // Update greeting on Home page
    const heroName = document.getElementById("hero-student-name");
    if (heroName) heroName.textContent = user.name || "Student";
  } else {
    // Logged out / guest
    protectedLinks.forEach((link) => (link.style.display = "none"));
    if (userCluster) userCluster.style.display = "none";

    // If user already registered, highlight login
    if (navLogin) navLogin.style.display = "inline-flex";
    if (navRegister) navRegister.style.display = hasUserRegistered() ? "none" : "inline-flex";
  }
}

function showPage(pageId) {
  const loggedIn = isUserLoggedIn();

  // Route Guard: if target page is protected and user is not logged in, enforce flow
  if (PROTECTED_PAGES.includes(pageId) && !loggedIn) {
    if (hasUserRegistered()) {
      showToast("🔐 Please sign in to access your study portal.");
      pageId = "login";
    } else {
      showToast("📝 Please register your student account first.");
      pageId = "register";
    }
  }

  // Route Guard: if user is logged in, going to login or register sends them home
  if (loggedIn && (pageId === "login" || pageId === "register")) {
    pageId = "home";
  }

  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((p) => {
    p.classList.remove("active");
    p.style.display = "none";
  });

  // Display target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.style.display = "block";
    targetPage.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update active navigation link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";
    if (href.replace("#", "") === pageId) {
      link.classList.add("active");
    }
  });

  updateNavUI();

  // If navigating to resources or home, ensure data is fresh
  if (pageId === "resources" || pageId === "home") {
    fetchResources();
    fetchLiveStats();
  }
  if (pageId === "admin") {
    fetchLiveStats(true);
  }
}

function handleLogoClick() {
  if (isUserLoggedIn()) {
    showPage("home");
  } else if (hasUserRegistered()) {
    showPage("login");
  } else {
    showPage("register");
  }
}

// ================= INITIAL FLOW ROUTER =================

async function initializeAppFlow() {
  // First, verify if an active session exists on backend
  try {
    const res = await fetch("/api/session");
    if (res.ok) {
      const data = await res.json();
      if (data.loggedIn && data.user) {
        setLoggedInUser(data.user);
        showPage("home");
        return;
      }
    }
  } catch (e) {
    console.warn("Session check notice:", e.message);
  }

  // If not logged in on backend, verify client registration state
  if (isUserLoggedIn()) {
    showPage("home");
  } else if (hasUserRegistered()) {
    // Returning user: show Login page directly
    showPage("login");
    const lastEmail = localStorage.getItem(KEY_LAST_EMAIL);
    const loginEmailInput = document.getElementById("login-email");
    if (loginEmailInput && lastEmail) {
      loginEmailInput.value = lastEmail;
    }
  } else {
    // First time visitor: show Register page directly
    showPage("register");
  }

  // Fetch initial resources in background
  fetchResources();
}

// ================= REGISTRATION & LOGIN HANDLERS =================

// Registration
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const submitBtn = document.getElementById("register-submit-btn");

    if (!name || !email || !password) {
      showAuthMessage("register-message", "Please fill in all fields.", "error");
      return;
    }

    if (password.length < 6) {
      showAuthMessage("register-message", "Password must be at least 6 characters long.", "error");
      return;
    }

    showAuthMessage("register-message", "Creating account in Neon database...", "info");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Mark user as registered in localStorage
        markUserAsRegistered(email);

        showAuthMessage("register-message", "✓ Registration successful! Redirecting to Sign In...", "success");
        showToast("✓ Account created! Please sign in with your password.");

        // Pre-fill email in Login form
        const loginEmailInput = document.getElementById("login-email");
        if (loginEmailInput) loginEmailInput.value = email;

        registerForm.reset();

        // Redirect to Login Page
        setTimeout(() => {
          showAuthMessage("register-message", "", "");
          showPage("login");
          showAuthMessage("login-message", "Account registered! Enter your password to log in.", "info");
          const pwdField = document.getElementById("login-password");
          if (pwdField) pwdField.focus();
        }, 800);
      } else {
        // If email already registered, record registration and suggest login
        if (data.message && data.message.toLowerCase().includes("already registered")) {
          markUserAsRegistered(email);
          const loginEmailInput = document.getElementById("login-email");
          if (loginEmailInput) loginEmailInput.value = email;
        }
        showAuthMessage("register-message", `❌ ${data.message || "Registration failed."}`, "error");
        showToast(data.message || "Registration failed.");
      }
    } catch (err) {
      showAuthMessage("register-message", "Server connection error. Please try again.", "error");
      showToast("Server connection error.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Password strength indicator
const registerPwdInput = document.getElementById("register-password");
if (registerPwdInput) {
  registerPwdInput.addEventListener("input", (e) => {
    const val = e.target.value;
    const bar = document.getElementById("register-pwd-strength");
    if (!bar) return;

    if (!val) {
      bar.style.width = "0%";
      return;
    }
    let strength = 0;
    if (val.length >= 6) strength += 30;
    if (val.length >= 10) strength += 30;
    if (/[0-9]/.test(val)) strength += 20;
    if (/[^A-Za-z0-9]/.test(val)) strength += 20;

    bar.style.width = `${strength}%`;
    if (strength < 50) {
      bar.style.backgroundColor = "var(--danger)";
    } else if (strength < 80) {
      bar.style.backgroundColor = "var(--warning)";
    } else {
      bar.style.backgroundColor = "var(--success)";
    }
  });
}

// Login
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = document.getElementById("login-submit-btn");

    if (!email || !password) {
      showAuthMessage("login-message", "Please enter both email and password.", "error");
      return;
    }

    showAuthMessage("login-message", "Verifying credentials with Neon DB...", "info");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setLoggedInUser(data.user);
        markUserAsRegistered(email);

        showAuthMessage("login-message", `✓ Welcome, ${data.user.name}! Redirecting to Home...`, "success");
        showToast(`✓ Welcome, ${data.user.name}!`);

        loginForm.reset();

        // Redirect to Home
        setTimeout(() => {
          showAuthMessage("login-message", "", "");
          showPage("home");
        }, 600);
      } else {
        showAuthMessage("login-message", `❌ ${data.message || "Invalid credentials."}`, "error");
        showToast(data.message || "Login failed.");
      }
    } catch (err) {
      showAuthMessage("login-message", "Login failed due to connection error.", "error");
      showToast("Server connection error.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Logout
async function logoutUser() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch (e) {
    console.warn("Logout notice:", e.message);
  }

  clearSessionState();
  showToast("You have been signed out.");

  // Enforce returning user flow: redirect to login
  showPage("login");
  const lastEmail = localStorage.getItem(KEY_LAST_EMAIL);
  const loginEmailInput = document.getElementById("login-email");
  if (loginEmailInput && lastEmail) {
    loginEmailInput.value = lastEmail;
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
}

// ================= STUDY RESOURCES CONTROLLER =================

async function fetchResources() {
  try {
    const res = await fetch("/api/resources");
    if (res.ok) {
      const data = await res.json();
      allResources = data;
      renderResourcesGrid();
      renderHomeTrending();
    }
  } catch (err) {
    console.warn("Could not fetch resources from backend:", err.message);
  }
}

function renderResourcesGrid() {
  const container = document.getElementById("resources-grid-container");
  if (!container) return;

  const searchQuery = (document.getElementById("resource-search-input")?.value || "").toLowerCase().trim();

  const filtered = allResources.filter((item) => {
    const matchesSubject =
      activeSubjectFilter === "all" ||
      item.subject.toLowerCase() === activeSubjectFilter.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery) ||
      item.subject.toLowerCase().includes(searchQuery) ||
      item.summary.toLowerCase().includes(searchQuery) ||
      (item.content && item.content.toLowerCase().includes(searchQuery));

    return matchesSubject && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
        <h3>No resources match your search</h3>
        <p style="margin-top: 6px;">Try adjusting your keyword or resetting subject filters.</p>
        <button class="btn-secondary btn-sm" style="margin-top: 16px;" onclick="resetResourceFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (item) => `
    <div class="resource-card">
      <div>
        <div class="card-top-tags">
          <span class="subject-badge">${escapeHtml(item.subject)}</span>
          <span class="reading-pill">⏱️ ${escapeHtml(item.reading_time || "5 min read")}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
      </div>

      <div class="resource-card-actions">
        <button class="btn-primary btn-sm btn-block" onclick="openNotesModal('${item.id}')">
          📖 Read Notes
        </button>
        <button class="btn-secondary btn-sm" onclick="downloadResourceText('${item.id}')" title="Download text notes">
          ⬇️
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function renderHomeTrending() {
  const container = document.getElementById("home-featured-resources");
  if (!container) return;

  const featured = allResources.slice(0, 3);
  container.innerHTML = featured
    .map(
      (item) => `
    <div class="resource-card">
      <div>
        <div class="card-top-tags">
          <span class="subject-badge">${escapeHtml(item.subject)}</span>
          <span class="reading-pill">⏱️ ${escapeHtml(item.reading_time || "5 min read")}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
      </div>

      <div class="resource-card-actions">
        <button class="btn-primary btn-sm btn-block" onclick="openNotesModal('${item.id}')">
          📖 Read Notes
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

// Subject filter buttons
document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeSubjectFilter = chip.getAttribute("data-subject") || "all";
    renderResourcesGrid();
  });
});

// Search input
const searchInput = document.getElementById("resource-search-input");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    renderResourcesGrid();
  });
}

function resetResourceFilters() {
  activeSubjectFilter = "all";
  document.querySelectorAll(".filter-chip").forEach((c) => {
    if (c.getAttribute("data-subject") === "all") c.classList.add("active");
    else c.classList.remove("active");
  });
  const input = document.getElementById("resource-search-input");
  if (input) input.value = "";
  renderResourcesGrid();
}

// ================= NOTES READER MODAL =================

function openNotesModal(resourceId) {
  const resource = allResources.find((r) => r.id === resourceId);
  if (!resource) return;

  currentModalResource = resource;

  const modal = document.getElementById("notes-modal");
  document.getElementById("modal-title").textContent = resource.title;
  document.getElementById("modal-subject").textContent = resource.subject;
  document.getElementById("modal-reading-time").textContent = `⏱️ ${resource.reading_time || "5 min read"}`;
  document.getElementById("modal-level").textContent = `🎯 ${resource.level || "Core Syllabus"}`;
  document.getElementById("modal-summary").textContent = resource.summary;
  document.getElementById("modal-content").innerHTML = resource.content || `<p>${resource.summary}</p>`;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden"; // lock background scroll
}

function closeNotesModal() {
  const modal = document.getElementById("notes-modal");
  if (modal) modal.style.display = "none";
  document.body.style.overflow = "";
  currentModalResource = null;
}

// Close on backdrop click
const modalBackdrop = document.getElementById("notes-modal");
if (modalBackdrop) {
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) {
      closeNotesModal();
    }
  });
}

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeNotesModal();
  }
});

// Modal Actions
function copyModalNotes() {
  if (!currentModalResource) return;
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = currentModalResource.content;
  const plainText = `${currentModalResource.title}\nSubject: ${currentModalResource.subject}\n\n${tempDiv.textContent || tempDiv.innerText}`;

  navigator.clipboard.writeText(plainText).then(
    () => showToast("📋 Notes copied to clipboard!"),
    () => showToast("Failed to copy notes.")
  );
}

function downloadModalNotes() {
  if (!currentModalResource) return;
  downloadResourceText(currentModalResource.id);
}

function downloadResourceText(resourceId) {
  const res = allResources.find((r) => r.id === resourceId);
  if (!res) return;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = res.content;
  const contentText = `${res.title}\nSubject: ${res.subject}\nLevel: ${res.level}\n=========================================\n\nSummary:\n${res.summary}\n\nDetailed Course Notes:\n${tempDiv.textContent || tempDiv.innerText}\n\n---\nExported from StudyPortal Pro (Academic 2026)`;

  const blob = new Blob([contentText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${res.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_notes.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("⬇️ Notes downloaded successfully!");
}

function printModalNotes() {
  window.print();
}

// ================= AI STUDY ASSISTANT =================

function handleAiChipClick(promptText) {
  const input = document.getElementById("ai-query-input");
  if (input) {
    input.value = promptText;
    document.getElementById("ai-search-form")?.requestSubmit();
  }
}

function handleAiSearchSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("ai-query-input");
  const query = (input?.value || "").trim().toLowerCase();
  const resultsContainer = document.getElementById("ai-results-container");

  if (!query || !resultsContainer) return;

  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 30px 20px;">
      <div style="font-size: 32px; animation: spin 1s infinite linear; display: inline-block;">⚙️</div>
      <h3 style="margin-top: 14px; font-size: 18px;">Analyzing syllabus notes with AI assistant...</h3>
      <p style="color: var(--text-dim); font-size: 13px;">Searching indexed topics and generating concept summary</p>
    </div>
  `;

  setTimeout(() => {
    // Search indexed resources
    const matched = allResources.filter((item) => {
      return (
        item.title.toLowerCase().includes(query) ||
        item.subject.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        (item.content && item.content.toLowerCase().includes(query))
      );
    });

    if (matched.length > 0) {
      const topMatch = matched[0];
      resultsContainer.innerHTML = `
        <div style="animation: fadeIn 0.3s ease;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <span class="subject-badge">🤖 AI Synthesized Answer</span>
            <span style="font-size: 12px; color: #34d399; font-weight: 700;">✓ Matched Syllabus Notes</span>
          </div>
          
          <h2 style="font-family: var(--font-heading); font-size: 22px; margin-bottom: 10px;">
            ${escapeHtml(topMatch.title)}
          </h2>
          
          <div class="modal-callout" style="margin-bottom: 18px;">
            <strong>Core Concept:</strong>
            <p style="margin-top: 4px; font-size: 14px; color: #e2e8f0;">${escapeHtml(topMatch.summary)}</p>
          </div>

          <div style="background: rgba(11, 15, 25, 0.6); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 20px;">
            <h4 style="color: #818cf8; font-size: 14px; font-weight: 700; margin-bottom: 8px;">Key Takeaways for Exams:</h4>
            <ul style="padding-left: 20px; font-size: 13.5px; color: #cbd5e1; line-height: 1.6;">
              <li>Understand the fundamental differences and theoretical limits of the topic.</li>
              <li>Review the memory architecture and time-complexity implications.</li>
              <li>Verify proper syntax conventions and common edge cases.</li>
            </ul>
          </div>

          <div style="display: flex; gap: 12px; align-items: center;">
            <button class="btn-primary btn-sm" onclick="openNotesModal('${topMatch.id}')">
              📖 Read Full ${escapeHtml(topMatch.subject)} Notes
            </button>
            <button class="btn-secondary btn-sm" onclick="downloadResourceText('${topMatch.id}')">
              ⬇️ Save Summary (.txt)
            </button>
          </div>
        </div>
      `;
    } else {
      resultsContainer.innerHTML = `
        <div style="animation: fadeIn 0.3s ease;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
            <span class="subject-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">🤖 AI Assistant Insight</span>
          </div>

          <h3 style="font-size: 20px; margin-bottom: 10px;">Overview: "${escapeHtml(input.value)}"</h3>
          <p style="color: #cbd5e1; font-size: 14.5px; line-height: 1.6; margin-bottom: 16px;">
            In computer science and software engineering, understanding <strong>${escapeHtml(input.value)}</strong> requires mastering both the conceptual model and implementation mechanics. We recommend referencing related modules in our library:
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button class="btn-secondary btn-sm" onclick="showPage('resources')">📚 Explore C Programming</button>
            <button class="btn-secondary btn-sm" onclick="showPage('resources')">📚 Explore Data Structures</button>
            <button class="btn-secondary btn-sm" onclick="showPage('resources')">📚 Explore Web Dev</button>
          </div>
        </div>
      `;
    }
  }, 400);
}

// ================= UPLOAD CONTROLLER =================

let selectedUploadFile = null;

function handleFileSelected(input) {
  if (input.files && input.files[0]) {
    selectedUploadFile = input.files[0];
    const nameEl = document.getElementById("dropzone-file-name");
    if (nameEl) {
      nameEl.textContent = `Attached: ${selectedUploadFile.name} (${(selectedUploadFile.size / 1024).toFixed(1)} KB)`;
      nameEl.style.color = "#34d399";
    }
  }
}

// Drag & drop support
const dropzone = document.getElementById("upload-dropzone");
if (dropzone) {
  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });
  });
  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
    });
  });
  dropzone.addEventListener("drop", (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectedUploadFile = e.dataTransfer.files[0];
      const nameEl = document.getElementById("dropzone-file-name");
      if (nameEl) {
        nameEl.textContent = `Attached: ${selectedUploadFile.name} (${(selectedUploadFile.size / 1024).toFixed(1)} KB)`;
        nameEl.style.color = "#34d399";
      }
    }
  });
}

async function handleUploadSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("upload-title").value.trim();
  const subject = document.getElementById("upload-subject").value;
  const description = document.getElementById("upload-description").value.trim();
  const submitBtn = document.getElementById("upload-submit-btn");

  if (!title || !description) {
    showAuthMessage("upload-feedback", "Please enter a title and description.", "error");
    return;
  }

  showAuthMessage("upload-feedback", "Publishing resource to Neon PostgreSQL database...", "info");
  if (submitBtn) submitBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("description", description);
    if (selectedUploadFile) {
      formData.append("resourceFile", selectedUploadFile);
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showAuthMessage("upload-feedback", "✓ Resource published to portal database successfully!", "success");
      showToast("✓ Resource uploaded and published!");

      // Refresh resources
      fetchResources();
      fetchLiveStats();

      // Reset form
      document.getElementById("upload-form").reset();
      selectedUploadFile = null;
      const nameEl = document.getElementById("dropzone-file-name");
      if (nameEl) {
        nameEl.textContent = "Click or Drag & Drop File Here";
        nameEl.style.color = "";
      }

      setTimeout(() => {
        showAuthMessage("upload-feedback", "", "");
        showPage("resources");
      }, 1200);
    } else {
      showAuthMessage("upload-feedback", `❌ ${data.message || "Upload failed."}`, "error");
    }
  } catch (err) {
    showAuthMessage("upload-feedback", "Failed to connect to backend server.", "error");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ================= LIVE STATS & ADMIN =================

async function fetchLiveStats(showNotification = false) {
  try {
    const res = await fetch("/api/stats");
    if (res.ok) {
      const stats = await res.json();

      const userEl = document.getElementById("dash-stat-users");
      const resEl = document.getElementById("dash-stat-resources");
      const subEl = document.getElementById("dash-stat-subjects");
      const readEl = document.getElementById("dash-stat-reads");

      const adminUserEl = document.getElementById("admin-user-count");
      const adminResEl = document.getElementById("admin-res-count");

      if (userEl) userEl.textContent = `${stats.users}+`;
      if (resEl) resEl.textContent = stats.resources;
      if (subEl) subEl.textContent = stats.subjects;
      if (readEl) readEl.textContent = stats.reads || "2.4k+";

      if (adminUserEl) adminUserEl.textContent = stats.users;
      if (adminResEl) adminResEl.textContent = stats.resources;

      if (showNotification) {
        showToast("✓ Live Neon metrics refreshed successfully.");
      }
    }
  } catch (e) {
    console.warn("Stats fetch notice:", e.message);
  }
}

// ================= TOAST SYSTEM =================

function showToast(message) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

// Helper: Escape HTML strings to prevent XSS
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ================= BOOTSTRAP ON LOAD =================

document.addEventListener("DOMContentLoaded", () => {
  // Ensure theme is always clean light theme
  document.documentElement.removeAttribute("data-theme");
  try {
    localStorage.removeItem("studyportal_theme");
  } catch (e) {}
  initializeAppFlow();
});