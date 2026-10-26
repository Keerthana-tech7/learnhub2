/**
 * STUDYPORTAL PRO - APPLICATION LOGIC & FLOW CONTROLLER
 * High performance client logic for student authentication, Neon DB resources,
 * notes viewer, AI assistant, and strict role-based administration console.
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
let activeMaterialType = "all";
let currentModalResource = null;

// ================= AUTHENTICATION HELPERS =================

function hasUserRegistered() {
  return localStorage.getItem(KEY_REGISTERED) === "true";
}

function markUserAsRegistered(email) {
  localStorage.setItem(KEY_REGISTERED, "true");
  const isMasterAdmin = email && (email.toLowerCase() === "admin.studyportal@gmail.com" || email.toLowerCase() === "admin@studyportal.edu");
  if (email && !isMasterAdmin) {
    localStorage.setItem(KEY_LAST_EMAIL, email);
  } else {
    localStorage.removeItem(KEY_LAST_EMAIL);
  }
}

function isUserLoggedIn() {
  return sessionStorage.getItem(KEY_LOGGED_IN) === "true";
}

function setLoggedInUser(user) {
  sessionStorage.setItem(KEY_LOGGED_IN, "true");
  sessionStorage.setItem(KEY_USER_DATA, JSON.stringify(user));
  const isMasterAdmin = user && user.email && (user.email.toLowerCase() === "admin.studyportal@gmail.com" || user.email.toLowerCase() === "admin@studyportal.edu");
  if (user && user.email && user.role !== "admin" && !isMasterAdmin) {
    markUserAsRegistered(user.email);
  } else {
    localStorage.setItem(KEY_REGISTERED, "true");
    localStorage.removeItem(KEY_LAST_EMAIL);
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

// ================= NAVIGATION & ROLE-BASED CONTROLLER =================

function updateNavUI() {
  const loggedIn = isUserLoggedIn();
  const user = getCurrentUser();
  const isAdmin = user && user.role === "admin";

  const protectedLinks = document.querySelectorAll(".nav-auth-protected");
  const adminOnlyElements = document.querySelectorAll(".nav-admin-only");
  const navLogin = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const userCluster = document.getElementById("nav-user-cluster");
  const nameDisplay = document.getElementById("user-name-display");
  const avatarInitial = document.getElementById("user-avatar-initial");
  const roleBadge = document.getElementById("user-role-badge");

  if (loggedIn && user) {
    // Show normal student links
    protectedLinks.forEach((link) => (link.style.display = "inline-flex"));
    if (navLogin) navLogin.style.display = "none";
    if (navRegister) navRegister.style.display = "none";

    // Strict Role-Based Visibility:
    // Only show Admin Console links/tiles if role is 'admin'
    adminOnlyElements.forEach((el) => {
      el.style.display = isAdmin ? "inline-flex" : "none";
    });

    const adminTile = document.getElementById("dash-admin-tile");
    const studentTile = document.getElementById("dash-student-tile");
    if (adminTile) adminTile.style.display = isAdmin ? "flex" : "none";
    if (studentTile) studentTile.style.display = isAdmin ? "none" : "flex";

    // Show user profile pill
    if (userCluster) userCluster.style.display = "inline-flex";
    if (nameDisplay) nameDisplay.textContent = user.name || "Student";
    if (avatarInitial) {
      avatarInitial.textContent = (user.name ? user.name[0] : "U").toUpperCase();
    }
    if (roleBadge) {
      roleBadge.textContent = isAdmin ? "ADMIN" : "USER";
      roleBadge.className = `user-role-tag ${isAdmin ? "admin" : "user"}`;
    }

    // Update greeting on Home page
    const heroName = document.getElementById("hero-student-name");
    if (heroName) heroName.textContent = user.name || "Student";
  } else {
    // Logged out / guest state
    protectedLinks.forEach((link) => (link.style.display = "none"));
    adminOnlyElements.forEach((el) => (el.style.display = "none"));
    if (userCluster) userCluster.style.display = "none";

    if (navLogin) navLogin.style.display = "inline-flex";
    if (navRegister) navRegister.style.display = hasUserRegistered() ? "none" : "inline-flex";
  }

  // Update visibility of Navbar Back Button
  const navBackBtn = document.getElementById("nav-back-btn");
  if (navBackBtn) {
    const isSubPage = currentPageId && currentPageId !== "home" && currentPageId !== "register";
    if (navigationHistory.length > 0 || isSubPage) {
      navBackBtn.style.display = "inline-flex";
    } else {
      navBackBtn.style.display = "none";
    }
  }
}

// Navigation History Stack
const navigationHistory = [];
let currentPageId = null;

function showPage(pageId, pushToHistory = true) {
  const loggedIn = isUserLoggedIn();
  const user = getCurrentUser();

  // Route Guard: if target page is protected and user is not logged in, enforce flow
  if (PROTECTED_PAGES.includes(pageId) && !loggedIn) {
    if (hasUserRegistered()) {
      showToast("Please sign in to access coursework resources.");
      pageId = "login";
    } else {
      showToast("Please register an account to access the portal.");
      pageId = "register";
    }
  }

  // Admin Route Protection: ONLY role === 'admin' can access #admin
  if (pageId === "admin") {
    if (!loggedIn || !user || user.role !== "admin") {
      showToast("Access restricted: Administrator credentials required.");
      pageId = "home";
    } else {
      loadAdminUsersTable();
      loadAdminResourcesTable();
    }
  }

  // Route Guard: if user is logged in, going to login or register sends them home
  if (loggedIn && (pageId === "login" || pageId === "register")) {
    pageId = "home";
  }

  // Record history if navigating to a different page
  if (pushToHistory && currentPageId && currentPageId !== pageId) {
    navigationHistory.push(currentPageId);
  }
  currentPageId = pageId;

  // Sync hash in browser URL
  if (window.location.hash.replace("#", "") !== pageId) {
    window.history.pushState({ pageId }, "", `#${pageId}`);
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

  if (pageId === "login" || pageId === "register") {
    clearAdminAutofill();
  }

  // Fresh data when visiting resources or home
  if (pageId === "resources" || pageId === "home") {
    fetchResources();
    fetchLiveStats();
  }

  // Admin page load
  if (pageId === "admin") {
    loadAdminUsersTable();
    loadAdminNotificationsTable();
    fetchLiveStats();
  }
}

function navigateBack() {
  if (navigationHistory.length > 0) {
    const prevPage = navigationHistory.pop();
    showPage(prevPage, false);
  } else {
    // If no stack, fall back gracefully
    if (isUserLoggedIn()) {
      if (currentPageId !== "home") {
        showPage("home", false);
      } else if (window.history.length > 1) {
        window.history.back();
      }
    } else if (hasUserRegistered()) {
      showPage("login", false);
    } else {
      showPage("register", false);
    }
  }
}

// Support browser Back/Forward buttons
window.addEventListener("popstate", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(hash)) {
    showPage(hash, false);
  }
});

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
  // Purge any stored admin credentials/email from local storage
  const lastEmail = localStorage.getItem(KEY_LAST_EMAIL);
  if (lastEmail === "admin.studyportal@gmail.com" || lastEmail === "admin@studyportal.edu") {
    localStorage.removeItem(KEY_LAST_EMAIL);
  }

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
    // Returning user: show Login page directly with clean fields
    showPage("login");
    clearAdminAutofill();
  } else {
    // First time visitor: show Register page directly
    showPage("register");
    clearAdminAutofill();
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

    showAuthMessage("register-message", "Registering account in Neon database...", "info");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        markUserAsRegistered(email);

        showAuthMessage("register-message", "Registration successful. Redirecting to sign in...", "success");
        showToast("Account created. Please sign in with your credentials.");

        // Pre-fill email in Login form
        const loginEmailInput = document.getElementById("login-email");
        if (loginEmailInput) loginEmailInput.value = email;

        registerForm.reset();

        setTimeout(() => {
          showAuthMessage("register-message", "", "");
          showPage("login");
          showAuthMessage("login-message", "Account registered. Enter your password to sign in.", "info");
          const pwdField = document.getElementById("login-password");
          if (pwdField) pwdField.focus();
        }, 800);
      } else {
        if (data.message && data.message.toLowerCase().includes("already registered")) {
          markUserAsRegistered(email);
          const loginEmailInput = document.getElementById("login-email");
          if (loginEmailInput) loginEmailInput.value = email;
        }
        showAuthMessage("register-message", data.message || "Registration failed.", "error");
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
      bar.style.backgroundColor = "var(--accent-red)";
    } else if (strength < 80) {
      bar.style.backgroundColor = "var(--accent-amber)";
    } else {
      bar.style.backgroundColor = "var(--accent-emerald)";
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

    showAuthMessage("login-message", "Verifying credentials with Neon database...", "info");
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

        showAuthMessage("login-message", `Welcome, ${data.user.name}. Opening dashboard...`, "success");
        showToast(`Signed in as ${data.user.name} (${data.user.role === 'admin' ? 'Administrator' : 'Student'}).`);

        loginForm.reset();

        setTimeout(() => {
          showAuthMessage("login-message", "", "");
          showPage("home");
        }, 600);
      } else {
        showAuthMessage("login-message", data.message || "Invalid credentials.", "error");
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

  // Enforce returning user flow: redirect to login with clean inputs
  showPage("login");
  const loginEmailInput = document.getElementById("login-email");
  if (loginEmailInput) {
    loginEmailInput.value = "";
  }
  const loginPasswordInput = document.getElementById("login-password");
  if (loginPasswordInput) {
    loginPasswordInput.value = "";
  }
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
}

// ================= STUDY RESOURCES CONTROLLER =================

function isPyqResource(item) {
  if (!item) return false;
  return (
    (item.id && item.id.startsWith("pyq-")) ||
    (item.level && item.level.toLowerCase().includes("question paper")) ||
    (item.reading_time && item.reading_time.toLowerCase().includes("exam"))
  );
}

function updateMaterialTypeCounts() {
  const total = allResources.length;
  const pyqCount = allResources.filter(isPyqResource).length;
  const notesCount = total - pyqCount;

  const countAll = document.getElementById("count-all-mat");
  if (countAll) countAll.textContent = total;

  const countPyq = document.getElementById("count-pyq-mat");
  if (countPyq) countPyq.textContent = pyqCount;

  const countNotes = document.getElementById("count-notes-mat");
  if (countNotes) countNotes.textContent = notesCount;

  const countBadge = document.getElementById("count-pyq-badge");
  if (countBadge) countBadge.textContent = `${pyqCount} Papers`;
}

async function fetchResources() {
  try {
    const res = await fetch("/api/resources");
    if (res.ok) {
      const data = await res.json();
      allResources = data;
      updateMaterialTypeCounts();
      renderResourcesGrid();
      renderHomeTrending();
    }
  } catch (err) {
    console.warn("Could not fetch resources from backend:", err.message);
  }
}

function filterByMaterialType(type, btn) {
  activeMaterialType = type || "all";
  document.querySelectorAll(".type-pill").forEach((p) => p.classList.remove("active"));
  if (btn) {
    btn.classList.add("active");
  } else {
    const matching = document.querySelector(`.type-pill[data-type="${type}"]`);
    if (matching) matching.classList.add("active");
  }
  renderResourcesGrid();
}

function openPreviousYearQuestionPapers(subject = "all") {
  showPage("resources");
  filterByMaterialType("pyq");
  if (subject && subject !== "all") {
    activeSubjectFilter = subject;
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      if (chip.getAttribute("data-subject") === subject) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  } else {
    activeSubjectFilter = "all";
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      if (chip.getAttribute("data-subject") === "all") {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  }
  renderResourcesGrid();
}

function renderResourceCardHtml(item) {
  const isPyq = isPyqResource(item);
  const is2024 = item.title.includes("2024");
  const is2023 = item.title.includes("2023");
  const yearTag = is2024 ? "2024 SEMESTER EXAM" : is2023 ? "2023 SEMESTER EXAM" : "PREVIOUS YEAR EXAM";

  return `
    <div class="resource-card ${isPyq ? 'is-pyq' : ''}" data-subject="${escapeHtml(item.subject)}">
      <div>
        <div class="card-top-tags">
          <span class="subject-badge" data-subject="${escapeHtml(item.subject)}">
            <span class="subject-dot"></span>
            ${escapeHtml(item.subject)}
          </span>
          <span class="reading-pill">
            <svg class="icon" viewBox="0 0 24 24" style="width: 12px; height: 12px; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${escapeHtml(item.reading_time || "5 min read")}
          </span>
        </div>
        ${isPyq ? `<div class="pyq-badge-tag"><svg class="icon" viewBox="0 0 24 24" style="width: 12px; height: 12px; margin-right: 4px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> ${yearTag}</div>` : ''}
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
      </div>

      <div class="resource-card-actions">
        ${isPyq ? `
        <button class="btn-primary btn-sm btn-block btn-pyq-action" onclick="openNotesModal('${item.id}')">
          <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>View Question Paper</span>
        </button>
        ` : `
        <button class="btn-primary btn-sm btn-block" onclick="openNotesModal('${item.id}')">
          <svg class="icon" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span>Read Notes</span>
        </button>
        `}
        <button class="btn-secondary btn-sm" onclick="downloadResourceText('${item.id}')" title="Download plain text file">
          <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Download</span>
        </button>
      </div>
    </div>
  `;
}

function renderResourcesGrid() {
  const container = document.getElementById("resources-grid-container");
  if (!container) return;

  const searchQuery = (document.getElementById("resource-search-input")?.value || "").toLowerCase().trim();

  const filtered = allResources.filter((item) => {
    // Subject filter
    const matchesSubject =
      activeSubjectFilter === "all" ||
      item.subject.toLowerCase() === activeSubjectFilter.toLowerCase();

    // Material type filter
    const isPyq = isPyqResource(item);
    let matchesType = true;
    if (activeMaterialType === "pyq") {
      matchesType = isPyq;
    } else if (activeMaterialType === "notes") {
      matchesType = !isPyq;
    }

    // Search query
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery) ||
      item.subject.toLowerCase().includes(searchQuery) ||
      item.summary.toLowerCase().includes(searchQuery) ||
      (item.level && item.level.toLowerCase().includes(searchQuery)) ||
      (item.content && item.content.toLowerCase().includes(searchQuery));

    return matchesSubject && matchesType && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; color: var(--text-dim); background: #ffffff; border: 1px solid var(--border-hairline); border-radius: var(--radius-md); box-shadow: var(--shadow-xs);">
        <h3 style="color: var(--text-main); font-size: 16px; margin-bottom: 4px;">No matching materials found</h3>
        <p style="font-size: 13px;">Adjust search keywords or reset discipline & material type filters.</p>
        <button class="btn-secondary btn-sm" style="margin-top: 14px;" onclick="resetResourceFilters()">Reset Filters</button>
      </div>
    `;
    return;
  }

  const pyqList = filtered.filter(isPyqResource);
  const notesList = filtered.filter((item) => !isPyqResource(item));

  // If user explicitly chose "pyq" only
  if (activeMaterialType === "pyq") {
    container.innerHTML = `
      <div class="resource-single-column-layout">
        <div class="resource-column-header">
          <div class="resource-column-heading-box">
            <div class="column-title-pill pyq-pill">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <h2>Previous Year Questions Papers</h2>
            </div>
            <p class="resource-column-sub">Authentic semester university examination papers with solution blueprints</p>
          </div>
          <span class="column-count-badge pyq-badge">${pyqList.length} Papers</span>
        </div>
        <div class="column-cards-grid single-col-grid" style="margin-top: 16px;">
          ${pyqList.map(renderResourceCardHtml).join("")}
        </div>
      </div>
    `;
    return;
  }

  // If user explicitly chose "notes" only
  if (activeMaterialType === "notes") {
    container.innerHTML = `
      <div class="resource-single-column-layout">
        <div class="resource-column-header">
          <div class="resource-column-heading-box">
            <div class="column-title-pill discipline-pill">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <h2>Disciplines</h2>
            </div>
            <p class="resource-column-sub">Curated syllabus lecture notes, revision summaries, and runnable programs</p>
          </div>
          <span class="column-count-badge discipline-badge">${notesList.length} Modules</span>
        </div>
        <div class="column-cards-grid single-col-grid" style="margin-top: 16px;">
          ${notesList.map(renderResourceCardHtml).join("")}
        </div>
      </div>
    `;
    return;
  }

  // Default / "all": Render in two side-by-side columns:
  // Column 1: "Previous Year Questions Papers"
  // Column 2: "Disciplines"
  container.innerHTML = `
    <div class="resource-two-columns-layout">
      <!-- Column 1: Previous Year Questions Papers -->
      <div class="resource-column resource-column-pyq">
        <div class="resource-column-header">
          <div class="resource-column-heading-box">
            <div class="column-title-pill pyq-pill">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <h2>Previous Year Questions Papers</h2>
            </div>
            <p class="resource-column-sub">Authentic semester university examination papers with solution blueprints</p>
          </div>
          <span class="column-count-badge pyq-badge">${pyqList.length} Papers</span>
        </div>

        <div class="column-cards-grid">
          ${pyqList.length > 0 ? pyqList.map(renderResourceCardHtml).join("") : `
            <div class="column-empty-state">
              <p>No question papers found for the selected filter.</p>
            </div>
          `}
        </div>
      </div>

      <!-- Column 2: Disciplines -->
      <div class="resource-column resource-column-disciplines">
        <div class="resource-column-header">
          <div class="resource-column-heading-box">
            <div class="column-title-pill discipline-pill">
              <svg class="icon icon-sm" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <h2>Disciplines</h2>
            </div>
            <p class="resource-column-sub">Curated syllabus lecture notes, revision summaries, and runnable programs</p>
          </div>
          <span class="column-count-badge discipline-badge">${notesList.length} Modules</span>
        </div>

        <div class="column-cards-grid">
          ${notesList.length > 0 ? notesList.map(renderResourceCardHtml).join("") : `
            <div class="column-empty-state">
              <p>No discipline notes found for the selected filter.</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderHomeTrending() {
  const container = document.getElementById("home-featured-resources");
  if (!container) return;

  const featured = allResources.slice(0, 3);
  container.innerHTML = featured.map(renderResourceCardHtml).join("");
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
  activeMaterialType = "all";
  document.querySelectorAll(".type-pill").forEach((p) => {
    if (p.getAttribute("data-type") === "all") p.classList.add("active");
    else p.classList.remove("active");
  });
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
  const isPyq = isPyqResource(resource);

  const modal = document.getElementById("notes-modal");
  document.getElementById("modal-title").textContent = resource.title;
  const modalSubject = document.getElementById("modal-subject");
  if (modalSubject) {
    modalSubject.textContent = resource.subject;
    modalSubject.setAttribute("data-subject", resource.subject);
  }
  document.getElementById("modal-reading-time").textContent = resource.reading_time || "5 min read";
  document.getElementById("modal-level").textContent = resource.level || (isPyq ? "Previous Year Question Paper" : "Core Syllabus");
  document.getElementById("modal-summary").textContent = resource.summary;
  document.getElementById("modal-content").innerHTML = resource.content || `<p>${resource.summary}</p>`;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
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
  const isPyq = isPyqResource(currentModalResource);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = currentModalResource.content;
  const header = isPyq ? "PREVIOUS YEAR QUESTION PAPER" : "COURSE STUDY NOTES";
  const plainText = `${header}: ${currentModalResource.title}\nSubject: ${currentModalResource.subject}\nLevel: ${currentModalResource.level}\n\n${tempDiv.textContent || tempDiv.innerText}`;

  navigator.clipboard.writeText(plainText).then(
    () => showToast(isPyq ? "Question paper copied to clipboard." : "Coursework notes copied to clipboard."),
    () => showToast("Failed to copy text.")
  );
}

function downloadModalNotes() {
  if (!currentModalResource) return;
  downloadResourceText(currentModalResource.id);
}

function downloadResourceText(resourceId) {
  const res = allResources.find((r) => r.id === resourceId);
  if (!res) return;

  const isPyq = isPyqResource(res);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = res.content;
  const headerTitle = isPyq ? "PREVIOUS YEAR QUESTION PAPER" : "COURSE STUDY NOTES";
  const contentText = `==========================================================\n${headerTitle}\n${res.title}\nSubject: ${res.subject}\nLevel: ${res.level}\nDuration/Reading Time: ${res.reading_time}\n==========================================================\n\nSummary Overview:\n${res.summary}\n\n${isPyq ? 'Examination Structure & Questions:' : 'Detailed Course Notes:'}\n${tempDiv.textContent || tempDiv.innerText}\n\n----------------------------------------------------------\nExported from StudyPortal Pro (Academic 2026 Repository)`;

  const blob = new Blob([contentText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const suffix = isPyq ? "question_paper" : "notes";
  a.download = `${res.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}_${suffix}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(isPyq ? "Question paper downloaded successfully." : "Course notes downloaded successfully.");
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
    <div style="text-align: center; padding: 28px 20px;">
      <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Analyzing coursework repository...</h3>
      <p style="color: var(--text-dim); font-size: 13px;">Synthesizing technical concept and reference examples</p>
    </div>
  `;

  setTimeout(() => {
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
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <span class="subject-badge" data-subject="${escapeHtml(topMatch.subject)}">
              <span class="subject-dot"></span>
              ${escapeHtml(topMatch.subject)}
            </span>
            <span class="sample-verified-badge">
              <svg class="icon" viewBox="0 0 24 24" style="width: 12px; height: 12px;"><polyline points="20 6 9 17 4 12"/></svg>
              Matched Syllabus Material
            </span>
          </div>
          
          <h2 style="font-family: var(--font-heading); font-size: 22px; font-weight: 800; margin-bottom: 10px; color: var(--text-main);">
            ${escapeHtml(topMatch.title)}
          </h2>
          
          <div class="modal-callout" style="margin-bottom: 16px;">
            <strong>Core Concept:</strong>
            <p style="margin-top: 4px; font-size: 13.5px; color: var(--text-body); line-height: 1.6;">${escapeHtml(topMatch.summary)}</p>
          </div>

          <div style="background: var(--bg-subtle); border: 1px solid var(--border-hairline); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 20px;">
            <h4 style="font-size: 13.5px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Key Curriculum Principles:</h4>
            <ul style="padding-left: 20px; font-size: 13px; color: var(--text-body); line-height: 1.65;">
              <li>Examine architectural and runtime memory implications.</li>
              <li>Analyze best/worst case computational complexity bounds.</li>
              <li>Adhere to safe syntax, error handling, and parameterization.</li>
            </ul>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="btn-primary btn-sm" onclick="openNotesModal('${topMatch.id}')">
              <svg class="icon" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>Read Complete ${escapeHtml(topMatch.subject)} Module</span>
            </button>
            <button class="btn-secondary btn-sm" onclick="downloadResourceText('${topMatch.id}')">
              <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Download Plain Text</span>
            </button>
          </div>
        </div>
      `;
    } else {
      resultsContainer.innerHTML = `
        <div>
          <div style="margin-bottom: 10px;">
            <span class="subject-badge">Conceptual Summary</span>
          </div>

          <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Analysis: "${escapeHtml(input.value)}"</h3>
          <p style="color: var(--text-body); font-size: 13.5px; line-height: 1.6; margin-bottom: 14px;">
            In computer science and systems programming, understanding <strong>${escapeHtml(input.value)}</strong> requires mastering both the mathematical model and concrete implementation mechanics. We recommend reviewing these core disciplines in our library:
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <button class="btn-secondary btn-sm" onclick="showPage('resources')">C Programming Notes</button>
            <button class="btn-secondary btn-sm" onclick="showPage('resources')">Data Structures Notes</button>
            <button class="btn-secondary btn-sm" onclick="showPage('resources')">Web Engineering Notes</button>
          </div>
        </div>
      `;
    }
  }, 350);
}

// ================= UPLOAD CONTROLLER =================

let selectedUploadFile = null;

function handleFileSelected(input) {
  if (input.files && input.files[0]) {
    selectedUploadFile = input.files[0];
    const nameEl = document.getElementById("dropzone-file-name");
    if (nameEl) {
      nameEl.textContent = `Attached: ${selectedUploadFile.name} (${(selectedUploadFile.size / 1024).toFixed(1)} KB)`;
      nameEl.style.color = "var(--text-main)";
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
        nameEl.style.color = "var(--text-main)";
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

  showAuthMessage("upload-feedback", "Publishing document to Neon database...", "info");
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
      showAuthMessage("upload-feedback", "Document published to repository successfully.", "success");
      showToast("Document published to coursework repository.");

      fetchResources();
      fetchLiveStats();

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
      }, 1000);
    } else {
      showAuthMessage("upload-feedback", data.message || "Upload failed.", "error");
    }
  } catch (err) {
    showAuthMessage("upload-feedback", "Connection error. Please try again.", "error");
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// ================= ADMIN MANAGEMENT CONSOLE =================

function switchAdminTab(tabName, btn) {
  document.querySelectorAll(".admin-tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".admin-tab-panel").forEach((p) => p.classList.remove("active"));

  if (btn) btn.classList.add("active");
  const panel = document.getElementById(`admin-panel-${tabName}`);
  if (panel) panel.classList.add("active");

  if (tabName === "users") loadAdminUsersTable();
  if (tabName === "resources") loadAdminResourcesTable();
  if (tabName === "notifications") loadAdminNotificationsTable();
}

async function loadAdminUsersTable() {
  const tbody = document.getElementById("admin-users-table-body");
  const totalBadge = document.getElementById("admin-user-total-badge");
  if (!tbody) return;

  try {
    const res = await fetch("/api/admin/users");
    const data = await res.json();

    if (res.ok && data.users) {
      if (totalBadge) totalBadge.textContent = `${data.users.length} Users`;
      tbody.innerHTML = data.users
        .map((u) => {
          const dateStr = u.created_at ? new Date(u.created_at).toLocaleDateString() : "Active";
          const isAdmin = u.role === "admin";
          return `
            <tr>
              <td style="font-family: var(--font-mono); color: var(--text-dim);">${u.id}</td>
              <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(u.name)}</td>
              <td style="font-family: var(--font-mono); font-size: 12.5px;">${escapeHtml(u.email)}</td>
              <td>
                <span class="role-badge ${isAdmin ? 'admin' : 'user'}">
                  ${isAdmin ? 'ADMIN' : 'USER'}
                </span>
              </td>
              <td style="color: var(--text-dim); font-size: 12.5px;">${dateStr}</td>
              <td style="text-align: right;">
                <div class="admin-table-actions" style="justify-content: flex-end;">
                  ${
                    (u.email === "admin.studyportal@gmail.com" || u.email === "admin@studyportal.edu")
                      ? `<span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">Master</span>`
                      : `
                        <button class="btn-secondary btn-sm" onclick="toggleUserRole(${u.id}, '${isAdmin ? 'user' : 'admin'}')">
                          ${isAdmin ? 'Demote to User' : 'Make Admin'}
                        </button>
                        <button class="btn-danger btn-sm" onclick="deleteUserAccount(${u.id}, '${escapeHtml(u.email)}')">
                          Delete
                        </button>
                      `
                  }
                </div>
              </td>
            </tr>
          `;
        })
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">${data.message || "Failed to load directory."}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">Failed to connect to admin endpoint.</td></tr>`;
  }
}

async function toggleUserRole(userId, newRole) {
  if (!confirm(`Change role of user ID #${userId} to ${newRole.toUpperCase()}?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`User role updated to ${newRole.toUpperCase()}.`);
      loadAdminUsersTable();
    } else {
      showToast(data.message || "Could not update user role.");
    }
  } catch (e) {
    showToast("Error updating role.");
  }
}

async function deleteUserAccount(userId, userEmail) {
  if (!confirm(`Permanently delete account for ${userEmail}?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (res.ok) {
      showToast("User account removed.");
      loadAdminUsersTable();
      fetchLiveStats();
    } else {
      showToast(data.message || "Could not delete user account.");
    }
  } catch (e) {
    showToast("Error deleting account.");
  }
}

async function loadAdminResourcesTable() {
  const tbody = document.getElementById("admin-resources-table-body");
  const totalBadge = document.getElementById("admin-res-total-badge");
  if (!tbody) return;

  if (totalBadge) totalBadge.textContent = `${allResources.length} Modules`;

  tbody.innerHTML = allResources
    .map((r) => {
      return `
        <tr>
          <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(r.title)}</td>
          <td><span class="subject-badge">${escapeHtml(r.subject)}</span></td>
          <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-dim);">${escapeHtml(r.level || "Undergraduate")}</td>
          <td style="font-size: 13px;">${escapeHtml(r.uploader_name || "Faculty")}</td>
          <td style="text-align: right;">
            <div class="admin-table-actions" style="justify-content: flex-end;">
              <button class="btn-secondary btn-sm" onclick="openNotesModal('${r.id}')">
                View
              </button>
              <button class="btn-danger btn-sm" onclick="deleteResourceItem('${r.id}', '${escapeHtml(r.title)}')">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function deleteResourceItem(resourceId, title) {
  if (!confirm(`Delete resource module "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/resources/${resourceId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Resource module removed.");
      fetchResources().then(() => loadAdminResourcesTable());
      fetchLiveStats();
    } else {
      showToast(data.message || "Failed to remove resource.");
    }
  } catch (e) {
    showToast("Error removing resource.");
  }
}

// ================= ADMIN EMAIL NOTIFICATIONS =================

async function loadAdminNotificationsTable() {
  const tbody = document.getElementById("admin-notifications-table-body");
  const totalBadge = document.getElementById("admin-notif-total-badge");
  const counterBadge = document.getElementById("admin-notif-counter");
  const telemetryBadge = document.getElementById("admin-notif-stat-count");
  const targetEmailDisplay = document.getElementById("admin-target-email-display");
  const engineStatusDisplay = document.getElementById("admin-email-engine-status");
  if (!tbody) return;

  try {
    // 1. Fetch email status
    fetch("/api/admin/email-status")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.status) {
          if (targetEmailDisplay) targetEmailDisplay.textContent = data.status.adminEmail;
          const statusBadge = document.getElementById("smtp-status-badge");
          if (engineStatusDisplay) {
            engineStatusDisplay.textContent = data.status.isConfigured
              ? `Live SMTP (${data.status.sender})`
              : "Nodemailer (Active / Logging)";
          }
          if (statusBadge) {
            if (data.status.isConfigured) {
              statusBadge.className = "status-badge delivered";
              statusBadge.textContent = `✓ Live Inbox Delivery Active (${data.status.sender})`;
            } else {
              statusBadge.className = "status-badge logged";
              statusBadge.textContent = "Console & DB Logging Mode (Setup Below)";
            }
          }
        }
      })
      .catch(() => {});

    // 2. Fetch notifications log
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();

    if (res.ok && data.notifications) {
      const count = data.notifications.length;
      if (totalBadge) totalBadge.textContent = `${count} Alert${count === 1 ? "" : "s"}`;
      if (counterBadge) counterBadge.textContent = count;
      if (telemetryBadge) telemetryBadge.textContent = count;

      if (count === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 24px; text-align: center; color: var(--text-dim);">
              No registration alerts dispatched yet. New notifications will appear automatically here as users register.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = data.notifications
        .map((n) => {
          const dateObj = n.registered_at ? new Date(n.registered_at) : new Date();
          const dateStr = dateObj.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
          const timeStr = dateObj.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          });

          const isDelivered = n.status === "delivered";
          const isFailed = n.status && n.status.startsWith("failed");
          const badgeClass = isDelivered ? "delivered" : (isFailed ? "failed" : "logged");
          const badgeText = isDelivered ? "DELIVERED TO INBOX" : (isFailed ? "FAILED" : "DISPATCHED & LOGGED");

          return `
            <tr>
              <td style="font-family: var(--font-mono); color: var(--text-dim);">${n.id}</td>
              <td>
                <strong style="color: var(--text-main);">${escapeHtml(n.user_name || "New Student")}</strong>
                <span class="role-badge ${n.user_role === 'admin' ? 'admin' : 'user'}" style="margin-left: 6px; font-size: 9px;">${escapeHtml(n.user_role || 'user')}</span>
              </td>
              <td>
                <span style="font-family: var(--font-mono); font-size: 12.5px; color: var(--text-main);">${escapeHtml(n.user_email)}</span>
              </td>
              <td>
                <div style="font-size: 12.5px; color: var(--text-main); font-weight: 600;">${dateStr}</div>
                <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">${timeStr}</div>
              </td>
              <td>
                <span style="font-family: var(--font-mono); font-size: 12px; color: var(--blue-primary);">${escapeHtml(n.recipient || "admin.studyportal@gmail.com")}</span>
              </td>
              <td style="text-align: right;">
                <span class="status-badge ${badgeClass}">${badgeText}</span>
              </td>
            </tr>
          `;
        })
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">${data.message || "Failed to load notifications."}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">Failed to connect to notifications service.</td></tr>`;
  }
}

async function triggerTestAdminNotification() {
  const btn = document.getElementById("btn-test-email");
  const originalHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <span class="btn-spinner" style="display: inline-block; width: 14px; height: 14px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 6px;"></span>
      <span>Dispatching Alert...</span>
    `;
  }

  try {
    const res = await fetch("/api/admin/notifications/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || "Test alert notification dispatched to admin mailbox!");
      loadAdminNotificationsTable();
    } else {
      showToast(data.message || "Failed to dispatch test alert.");
    }
  } catch (e) {
    showToast("Error connecting to notification endpoint.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

async function saveEmailSettings() {
  const user = document.getElementById("smtp-sender-email").value.trim();
  const pass = document.getElementById("smtp-app-password").value.trim();
  const saveBtn = document.getElementById("btn-save-smtp");

  if (!user || !pass) {
    showToast("Please enter both Gmail address and 16-character App Password.");
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Verifying with Gmail...";
  }

  try {
    const res = await fetch("/api/admin/email-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast("✓ Live Gmail connected! Real emails will now be sent to admin.studyportal@gmail.com.");
      document.getElementById("smtp-app-password").value = "";
      loadAdminNotificationsTable();
    } else {
      showToast(data.message || "Failed to connect to Gmail.");
      alert(data.message || "Gmail verification failed. Ensure 2-Step Verification is ON and a 16-character App Password was used.");
    }
  } catch (e) {
    showToast("Error connecting to server.");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save & Connect Gmail";
    }
  }
}

// ================= LIVE STATS & TELEMETRY =================

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
      const adminNotifEl = document.getElementById("admin-notif-stat-count");
      const adminNotifCounter = document.getElementById("admin-notif-counter");

      if (userEl) userEl.textContent = stats.users;
      if (resEl) resEl.textContent = stats.resources;
      if (subEl) subEl.textContent = stats.subjects;
      if (readEl) readEl.textContent = stats.reads || "2.4k+";

      if (adminUserEl) adminUserEl.textContent = stats.users;
      if (adminResEl) adminResEl.textContent = stats.resources;
      if (adminNotifEl && typeof stats.notifications !== "undefined") adminNotifEl.textContent = stats.notifications;
      if (adminNotifCounter && typeof stats.notifications !== "undefined") adminNotifCounter.textContent = stats.notifications;

      if (showNotification) {
        showToast("Live telemetry refreshed.");
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
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(8px)";
    toast.style.transition = "all 0.2s ease";
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }, 3200);
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

// Helper: Safeguard to wipe any admin credentials or browser autofill on public auth screens
function clearAdminAutofill() {
  const loginEmail = document.getElementById("login-email");
  if (loginEmail && (!loginEmail.value || loginEmail.value.toLowerCase().includes("admin"))) {
    loginEmail.value = "";
  }
  const regEmail = document.getElementById("register-email");
  if (regEmail && (!regEmail.value || regEmail.value.toLowerCase().includes("admin"))) {
    regEmail.value = "";
  }
}

// ================= BOOTSTRAP ON LOAD =================

document.addEventListener("DOMContentLoaded", () => {
  initializeAppFlow();
  clearAdminAutofill();
  setTimeout(clearAdminAutofill, 150);
  setTimeout(clearAdminAutofill, 500);
});