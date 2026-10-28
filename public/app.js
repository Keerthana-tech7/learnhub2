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
let adminResourcesList = [];
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
  return sessionStorage.getItem(KEY_LOGGED_IN) === "true" || localStorage.getItem(KEY_LOGGED_IN) === "true";
}

function setLoggedInUser(user) {
  sessionStorage.setItem(KEY_LOGGED_IN, "true");
  sessionStorage.setItem(KEY_USER_DATA, JSON.stringify(user));
  localStorage.setItem(KEY_LOGGED_IN, "true");
  localStorage.setItem(KEY_USER_DATA, JSON.stringify(user));
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
    const raw = sessionStorage.getItem(KEY_USER_DATA) || localStorage.getItem(KEY_USER_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearSessionState() {
  sessionStorage.removeItem(KEY_LOGGED_IN);
  sessionStorage.removeItem(KEY_USER_DATA);
  localStorage.removeItem(KEY_LOGGED_IN);
  localStorage.removeItem(KEY_USER_DATA);
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

  // Update visibility of Mobile Bottom Nav Bar
  const mobileBottomNav = document.getElementById("mobile-bottom-nav");
  if (mobileBottomNav) {
    const isAuthPage = currentPageId === "login" || currentPageId === "register";
    mobileBottomNav.style.display = (loggedIn && !isAuthPage) ? "flex" : "none";
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

  // Update active navigation link on desktop and mobile
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";
    if (href.replace("#", "") === pageId) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.id === `mob-nav-${pageId}`) {
      btn.classList.add("active");
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

  // Initialize upload form & populated resources dropdown & load user tracking
  if (pageId === "upload") {
    initUploadPage();
    loadUserSubmittedRequests();
  }

  // Admin page load (parallel preload for instant tab switches)
  if (pageId === "admin") {
    loadAdminContributionsTable();
    loadAdminUsersTable();
    loadAdminResourcesTable();
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

  // Sync mobile quick section switcher counts
  const mobCountAll = document.getElementById("mob-count-all");
  if (mobCountAll) mobCountAll.textContent = total;

  const mobCountPyq = document.getElementById("mob-count-pyq");
  if (mobCountPyq) mobCountPyq.textContent = pyqCount;

  const mobCountNotes = document.getElementById("mob-count-notes");
  if (mobCountNotes) mobCountNotes.textContent = notesCount;
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
  if (btn && btn.classList.contains("type-pill")) {
    btn.classList.add("active");
  } else {
    const matching = document.querySelector(`.type-pill[data-type="${type}"]`);
    if (matching) matching.classList.add("active");
  }

  // Synchronize mobile section switcher active state
  document.querySelectorAll(".mob-switch-btn").forEach((b) => {
    if (b.getAttribute("data-type") === type) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

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
  document.querySelectorAll(".mob-switch-btn").forEach((b) => {
    if (b.getAttribute("data-type") === "all") b.classList.add("active");
    else b.classList.remove("active");
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
  const resource = allResources.find((r) => r.id === resourceId) || adminResourcesList.find((r) => r.id === resourceId);
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

// ================= RESOURCE CONTRIBUTION & UPLOAD CONTROLLER (Requirements 1, 3, 5, 6) =================

let selectedUploadFile = null;

// Initialize Upload Page with autofilled session details and populated resources dropdown
async function initUploadPage() {
  let user = getCurrentUser();
  if (!user) {
    try {
      const sessRes = await fetch("/api/session");
      if (sessRes.ok) {
        const sessData = await sessRes.json();
        if (sessData.loggedIn && sessData.user) {
          user = sessData.user;
          setCurrentUser(user);
        }
      }
    } catch (e) {
      // Ignore background session fetch errors
    }
  }

  const nameInput = document.getElementById("upload-contributor-name");
  const emailInput = document.getElementById("upload-contributor-email");
  const nameDisplay = document.getElementById("upload-user-name-display");
  const emailDisplay = document.getElementById("upload-user-email-display");
  const avatarEl = document.getElementById("upload-user-avatar");

  if (user) {
    if (nameInput) nameInput.value = user.name || "";
    if (emailInput) emailInput.value = user.email || "";
    if (nameDisplay) nameDisplay.textContent = user.name || "Registered Student";
    if (emailDisplay) emailDisplay.textContent = user.email || "";
    if (avatarEl) {
      avatarEl.textContent = (user.name ? user.name[0] : "U").toUpperCase();
    }
  }

  const subjectVal = document.getElementById("upload-subject")?.value || "C Programming";
  await populateExistingResourcesDropdown(subjectVal);
}

// Populate the existing resource dropdown based on active syllabus library
async function populateExistingResourcesDropdown(subjectFilter) {
  const selectEl = document.getElementById("upload-existing-resource");
  if (!selectEl) return;

  if (!allResources || allResources.length === 0) {
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        allResources = await res.json();
      }
    } catch (e) {
      console.warn("Notice: Preloading resources for contribution dropdown:", e);
    }
  }

  const prevSelectedVal = selectEl.value;
  selectEl.innerHTML = `<option value="">-- Select Existing Resource Module / Question Paper --</option>`;

  if (!allResources || allResources.length === 0) {
    return;
  }

  // Sort resources: matching category first, then alphabetically by title
  const sorted = [...allResources].sort((a, b) => {
    const aMatch = subjectFilter && a.subject && a.subject.toLowerCase() === subjectFilter.toLowerCase();
    const bMatch = subjectFilter && b.subject && b.subject.toLowerCase() === subjectFilter.toLowerCase();
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return (a.title || "").localeCompare(b.title || "");
  });

  sorted.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r.id;
    const subjTag = r.subject ? ` [${r.subject}]` : "";
    opt.textContent = `${r.title}${subjTag}`;
    if (r.id === prevSelectedVal) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });
}

function filterExistingResourcesDropdown(subject) {
  populateExistingResourcesDropdown(subject);
}

// File Selection Handler: Strictly enforce PDF format (Requirements 1 & 6)
function handleFileSelected(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    const nameEl = document.getElementById("dropzone-file-name");

    if (!isPdf) {
      showToast("Only PDF documents (.pdf) are permitted.");
      showAuthMessage("upload-feedback", "Invalid file type. Please select a .pdf document.", "error");
      input.value = "";
      selectedUploadFile = null;
      if (nameEl) {
        nameEl.textContent = "Click or Drag & Drop PDF File Here";
        nameEl.style.color = "";
      }
      return;
    }

    selectedUploadFile = file;
    showAuthMessage("upload-feedback", "", "");
    if (nameEl) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;
      nameEl.textContent = `Attached: ${file.name} (${sizeStr})`;
      nameEl.style.color = "#166534";
    }
  }
}

// Drag & drop PDF support
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
      const file = e.dataTransfer.files[0];
      const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
      const nameEl = document.getElementById("dropzone-file-name");
      const fileInput = document.getElementById("upload-file-input");

      if (!isPdf) {
        showToast("Only PDF documents (.pdf) are permitted.");
        showAuthMessage("upload-feedback", "Invalid file type. Please drop a .pdf document.", "error");
        selectedUploadFile = null;
        if (fileInput) fileInput.value = "";
        if (nameEl) {
          nameEl.textContent = "Click or Drag & Drop PDF File Here";
          nameEl.style.color = "";
        }
        return;
      }

      selectedUploadFile = file;
      showAuthMessage("upload-feedback", "", "");
      if (nameEl) {
        const sizeStr = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;
        nameEl.textContent = `Attached: ${file.name} (${sizeStr})`;
        nameEl.style.color = "#166534";
      }
    }
  });
}

// Handle Contribution Submission (Requirements 1, 2, 3, 5, 6)
async function handleUploadSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("upload-title").value.trim();
  const subject = document.getElementById("upload-subject").value;
  const existingResourceId = document.getElementById("upload-existing-resource").value;
  const description = document.getElementById("upload-description").value.trim();
  const content = document.getElementById("upload-content").value.trim();
  const submitBtn = document.getElementById("upload-submit-btn");

  if (!title) {
    showAuthMessage("upload-feedback", "Please enter a resource title.", "error");
    return;
  }

  if (!existingResourceId) {
    showAuthMessage("upload-feedback", "Please select which existing coursework resource this contribution belongs to.", "error");
    return;
  }

  if (!description) {
    showAuthMessage("upload-feedback", "Please provide a description of your contribution.", "error");
    return;
  }

  if (!content && !selectedUploadFile) {
    showAuthMessage("upload-feedback", "Please provide contribution content (study notes/code) or attach a PDF file.", "error");
    return;
  }

  if (selectedUploadFile && !selectedUploadFile.name.toLowerCase().endsWith(".pdf")) {
    showAuthMessage("upload-feedback", "Only PDF documents (.pdf) are permitted.", "error");
    return;
  }

  showAuthMessage("upload-feedback", "Submitting contribution for administrator approval...", "info");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="btn-spinner" style="display: inline-block; width: 14px; height: 14px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px;"></span>
      <span>Submitting Contribution...</span>
    `;
  }

  try {
    const user = getCurrentUser();
    const formData = new FormData();
    formData.append("resourceTitle", title);
    formData.append("title", title);
    formData.append("category", subject);
    formData.append("subject", subject);
    formData.append("existingResourceId", existingResourceId);
    formData.append("existing_resource_id", existingResourceId);
    formData.append("description", description);
    formData.append("contributionContent", content);
    formData.append("content", content);

    // Autofill contributor name & email from authenticated session user (never ask student to fill)
    const contributorName = (user && user.name) || document.getElementById("upload-contributor-name")?.value || "Student Contributor";
    const contributorEmail = (user && user.email) || document.getElementById("upload-contributor-email")?.value || "";

    formData.append("contributorName", contributorName);
    formData.append("contributorEmail", contributorEmail);
    if (selectedUploadFile) {
      formData.append("resourceFile", selectedUploadFile);
    }

    const response = await fetch("/api/contributions", {
      method: "POST",
      body: formData,
      credentials: "same-origin"
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const successMsg = data.message || "Your contribution request has been submitted successfully. Please wait for admin approval.";
      showAuthMessage(
        "upload-feedback",
        successMsg,
        "success"
      );
      showToast(successMsg);

      // Reset form
      document.getElementById("upload-form").reset();
      selectedUploadFile = null;
      const fileInput = document.getElementById("upload-file-input");
      if (fileInput) fileInput.value = "";
      const nameEl = document.getElementById("dropzone-file-name");
      if (nameEl) {
        nameEl.textContent = "Click or Drag & Drop PDF File Here";
        nameEl.style.color = "";
      }

      // Re-fill verified student identity
      initUploadPage();
      loadUserSubmittedRequests(true);
      fetchLiveStats();
      cachedAdminContributions = null;

      setTimeout(() => {
        showAuthMessage("upload-feedback", "", "");
      }, 7000);
    } else {
      showAuthMessage("upload-feedback", data.message || "Contribution submission failed.", "error");
      showToast(data.message || "Submission failed.");
    }
  } catch (err) {
    showAuthMessage("upload-feedback", "Network error while submitting. Please check connection and try again.", "error");
    showToast("Network error during submission.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>Submit Contribution for Administrator Approval</span>
      `;
    }
  }
}

// ================= CONTRIBUTOR STATUS TRACKING (Requirement 4) =================

// Contributor Subtabs: Switch between Submit Form and My Requests
function switchUploadTab(tabName, btn) {
  const formBtn = document.getElementById("upload-tab-btn-form");
  const requestsBtn = document.getElementById("upload-tab-btn-my-requests");
  const formPanel = document.getElementById("upload-panel-form");
  const requestsPanel = document.getElementById("upload-panel-my-requests");

  if (tabName === "my-requests") {
    if (formBtn) formBtn.classList.remove("active");
    if (requestsBtn) requestsBtn.classList.add("active");
    if (formPanel) {
      formPanel.style.display = "none";
      formPanel.classList.remove("active");
    }
    if (requestsPanel) {
      requestsPanel.style.display = "block";
      requestsPanel.classList.add("active");
    }
    loadUserSubmittedRequests();
  } else {
    if (formBtn) formBtn.classList.add("active");
    if (requestsBtn) requestsBtn.classList.remove("active");
    if (formPanel) {
      formPanel.style.display = "block";
      formPanel.classList.add("active");
    }
    if (requestsPanel) {
      requestsPanel.style.display = "none";
      requestsPanel.classList.remove("active");
    }
  }
}

// Fetch and render the authenticated student's submitted contribution requests
async function loadUserSubmittedRequests(forceFresh = false) {
  const tbody = document.getElementById("my-requests-table-body");
  const counterBadge = document.getElementById("upload-my-requests-counter");
  const totalEl = document.getElementById("my-stat-total");
  const pendingEl = document.getElementById("my-stat-pending");
  const approvedEl = document.getElementById("my-stat-approved");
  const rejectedEl = document.getElementById("my-stat-rejected");

  if (!isUserLoggedIn()) {
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 28px; text-align: center; color: var(--text-dim);">
            Please sign in to track your submitted contribution requests.
          </td>
        </tr>
      `;
    }
    return;
  }

  try {
    const res = await fetch(`/api/user/contributions${forceFresh ? "?_=" + Date.now() : ""}`, {
      credentials: "same-origin"
    });
    const data = await res.json();

    if (res.ok && data.contributions) {
      const list = data.contributions;
      const total = list.length;
      const pending = list.filter((c) => (c.status || "").toLowerCase() === "pending").length;
      const approved = list.filter((c) => (c.status || "").toLowerCase() === "approved").length;
      const rejected = list.filter((c) => (c.status || "").toLowerCase() === "rejected").length;

      if (totalEl) totalEl.textContent = total;
      if (pendingEl) pendingEl.textContent = pending;
      if (approvedEl) approvedEl.textContent = approved;
      if (rejectedEl) rejectedEl.textContent = rejected;

      if (counterBadge) {
        if (total > 0) {
          counterBadge.textContent = total;
          counterBadge.style.display = "inline-block";
        } else {
          counterBadge.style.display = "none";
        }
      }

      if (!tbody) return;

      if (list.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 36px 20px; text-align: center; color: var(--text-dim);">
              <div style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">No contribution requests submitted yet</div>
              <p style="font-size: 13px; margin: 0 0 16px 0;">Contribute notes or attachments for existing coursework to collaborate with your cohort.</p>
              <button class="btn-primary btn-sm" onclick="switchUploadTab('form')">+ Submit a Contribution Request</button>
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = list
        .map((c) => {
          const statusVal = (c.status || "Pending").toLowerCase();
          const isPending = statusVal === "pending";
          const isApproved = statusVal === "approved";
          const isRejected = statusVal === "rejected";

          const statusBadge = isPending
            ? `<span class="status-pill pending">⏳ Pending</span>`
            : isApproved
            ? `<span class="status-pill approved">✓ Approved</span>`
            : `<span class="status-pill rejected">✕ Rejected</span>`;

          const submittedFormatted = formatDateTimeWithTz(c.submitted_at);

          return `
            <tr style="${isPending ? "background: #fffdf5;" : ""}">
              <td>
                <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${escapeHtml(c.resource_title)}</div>
                <div style="margin-top: 4px;">
                  <span class="subject-badge" style="font-size: 10px; padding: 2px 7px;">${escapeHtml(c.category || "General")}</span>
                </div>
              </td>
              <td>
                <div style="font-weight: 600; color: #1e3a8a; font-size: 12.5px;">${escapeHtml(c.existing_resource_title || c.existing_resource_id || "General")}</div>
                <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-top: 1px;">ID: ${escapeHtml(c.existing_resource_id || "-")}</div>
              </td>
              <td>
                <div style="font-size: 12.5px; color: #334155; line-height: 1.45; max-width: 240px;">
                  ${escapeHtml(c.description || "-")}
                </div>
                ${
                  c.file_path
                    ? `<div style="margin-top: 6px;"><a href="${c.file_path}" target="_blank" style="font-size: 11.5px; color: var(--blue-primary); font-weight: 600; text-decoration: none;">📎 View Attached PDF</a></div>`
                    : ""
                }
                ${
                  c.contribution_content
                    ? `<div style="margin-top: 4px; font-size: 11px; color: #64748b; font-family: var(--font-mono); background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block;">📝 Text notes included</div>`
                    : ""
                }
              </td>
              <td>
                <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-main); line-height: 1.4;">
                  ${submittedFormatted}
                </div>
              </td>
              <td>${statusBadge}</td>
              <td style="text-align: right;">
                ${
                  isApproved
                    ? `<span style="font-size: 12px; color: #059669; font-weight: 600;">✓ Published in Resources</span>`
                    : isRejected
                    ? `<span style="font-size: 12px; color: #dc2626; font-weight: 600;">${escapeHtml(c.admin_feedback || "Declined by admin")}</span>`
                    : `<span style="font-size: 12px; color: #b45309; font-style: italic;">Awaiting admin approval</span>`
                }
              </td>
            </tr>
          `;
        })
        .join("");
    }
  } catch (err) {
    console.error("Load user requests error:", err);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">
            Failed to load your submitted requests. Please refresh.
          </td>
        </tr>
      `;
    }
  }
}

// ================= ADMIN MANAGEMENT CONSOLE (FAST & RESILIENT) =================

let cachedAdminUsers = null;
let cachedAdminNotifications = null;
let cachedAdminContributions = null;
let isFetchingAdminUsers = false;
let isFetchingAdminNotifs = false;
let isFetchingAdminContribs = false;
let activeContribFilter = "all";
let currentModalContrib = null;

function getAdminAuthHeaders() {
  const user = getCurrentUser();
  const headers = {
    "Accept": "application/json"
  };
  if (user && user.email) {
    headers["x-admin-email"] = user.email;
    if (user.role) headers["x-admin-role"] = user.role;
  }
  return headers;
}

function switchAdminTab(tabName, btn) {
  document.querySelectorAll(".admin-tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".admin-tab-panel").forEach((p) => p.classList.remove("active"));

  if (btn) btn.classList.add("active");
  const panel = document.getElementById(`admin-panel-${tabName}`);
  if (panel) panel.classList.add("active");

  if (tabName === "contributions") loadAdminContributionsTable();
  if (tabName === "users") loadAdminUsersTable();
  if (tabName === "resources") loadAdminResourcesTable();
  if (tabName === "notifications") loadAdminNotificationsTable();
}

// Helper: Format date and exact time including timezone (Requirement 2 & 4)
function formatDateTimeWithTz(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  });
}

// Update counter badges across filters and tabs
function updateContribCounterBadges(contributions) {
  if (!contributions) return;
  const total = contributions.length;
  const pending = contributions.filter((c) => (c.status || "").toLowerCase() === "pending").length;
  const approved = contributions.filter((c) => (c.status || "").toLowerCase() === "approved").length;
  const rejected = contributions.filter((c) => (c.status || "").toLowerCase() === "rejected").length;

  const countAll = document.getElementById("count-contrib-all");
  const countPending = document.getElementById("count-contrib-pending");
  const countApproved = document.getElementById("count-contrib-approved");
  const countRejected = document.getElementById("count-contrib-rejected");
  const totalBadge = document.getElementById("admin-contrib-total-badge");
  const tabCounter = document.getElementById("admin-contrib-counter");

  if (countAll) countAll.textContent = total;
  if (countPending) countPending.textContent = pending;
  if (countApproved) countApproved.textContent = approved;
  if (countRejected) countRejected.textContent = rejected;
  if (totalBadge) totalBadge.textContent = `${total} Submission${total === 1 ? "" : "s"}`;

  if (tabCounter) {
    if (pending > 0) {
      tabCounter.textContent = `${pending} Pending`;
      tabCounter.style.display = "inline-block";
    } else {
      tabCounter.style.display = "none";
    }
  }

  // Admin Pending Badges & Notification Banner (Requirement 2)
  const navBadge = document.getElementById("nav-admin-pending-badge");
  const mobBadge = document.getElementById("mob-admin-pending-badge");
  const alertBanner = document.getElementById("admin-new-contrib-alert-banner");
  const alertSub = document.getElementById("admin-new-contrib-alert-sub");

  if (navBadge) {
    if (pending > 0) {
      navBadge.textContent = pending;
      navBadge.style.display = "inline-flex";
    } else {
      navBadge.style.display = "none";
    }
  }

  if (mobBadge) {
    if (pending > 0) {
      mobBadge.textContent = pending;
      mobBadge.style.display = "inline-block";
    } else {
      mobBadge.style.display = "none";
    }
  }

  if (alertBanner) {
    if (pending > 0) {
      alertBanner.style.display = "block";
      if (alertSub) {
        alertSub.textContent = `${pending} pending contribution request${pending === 1 ? "" : "s"} require administrator review.`;
      }
    } else {
      alertBanner.style.display = "none";
    }
  }
}

// Load contribution requests table (Admin only - Requirement 4)
async function loadAdminContributionsTable(forceFresh = false) {
  const tbody = document.getElementById("admin-contributions-table-body");
  if (!tbody) return;

  if (forceFresh) {
    cachedAdminContributions = null;
    isFetchingAdminContribs = false;
  }

  // 1. Instant render from memory cache
  if (cachedAdminContributions && !forceFresh) {
    updateContribCounterBadges(cachedAdminContributions);
    renderAdminContributionsRows(cachedAdminContributions);
  }

  if (isFetchingAdminContribs && !forceFresh) return;
  isFetchingAdminContribs = true;

  try {
    const url = forceFresh 
      ? `/api/admin/contributions?fresh=true&_=${Date.now()}`
      : "/api/admin/contributions";
    const res = await fetch(url, {
      headers: { ...getAdminAuthHeaders(), "Cache-Control": forceFresh ? "no-cache" : "default" },
      credentials: "same-origin"
    });
    const data = await res.json();

    if (res.ok && data.contributions) {
      cachedAdminContributions = data.contributions;
      updateContribCounterBadges(cachedAdminContributions);
      renderAdminContributionsRows(cachedAdminContributions);
    } else {
      if (!cachedAdminContributions) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="padding: 24px; text-align: center; color: var(--accent-red);">
              <div style="margin-bottom: 8px;">${escapeHtml(data.message || "Failed to load contribution requests.")}</div>
              <button class="btn-secondary btn-sm" onclick="refreshAdminContributions(this)">↻ Retry Loading</button>
            </td>
          </tr>
        `;
      }
    }
  } catch (err) {
    if (!cachedAdminContributions) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 24px; text-align: center; color: var(--accent-red);">
            <div style="margin-bottom: 8px;">Failed to connect to contribution requests endpoint.</div>
            <button class="btn-secondary btn-sm" onclick="refreshAdminContributions(this)">↻ Retry Loading</button>
          </td>
        </tr>
      `;
    }
  } finally {
    isFetchingAdminContribs = false;
  }
}

async function refreshAdminContributions(btn) {
  let targetBtn = null;
  if (btn && btn.nodeType === 1) {
    targetBtn = btn.closest("button") || btn;
  } else {
    targetBtn = document.getElementById("btn-refresh-contributions");
  }
  const originalHtml = targetBtn ? targetBtn.innerHTML : "";

  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.innerHTML = `
      <span class="btn-spinner" style="display: inline-block; width: 14px; height: 14px; border: 2px solid #555; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 6px;"></span>
      <span>Refreshing...</span>
    `;
  }

  try {
    cachedAdminContributions = null;
    await loadAdminContributionsTable(true);
    showToast("✓ Contribution requests queue refreshed.");
  } catch (e) {
    console.error("Refresh contributions error:", e);
    showToast("Failed to refresh contribution queue.");
  } finally {
    if (targetBtn) {
      targetBtn.disabled = false;
      targetBtn.innerHTML = originalHtml;
    }
  }
}

// Filter contributions by status: All, Pending, Approved, Rejected (Requirement 4)
function filterContributionsByStatus(status, btn) {
  activeContribFilter = status || "all";
  document.querySelectorAll(".contrib-filter-btn").forEach((b) => {
    if (b.getAttribute("data-status") === status) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  const heading = document.getElementById("contrib-table-heading");
  if (heading) {
    if (status === "pending") heading.textContent = "Pending Contribution Requests";
    else if (status === "approved") heading.textContent = "Approved Contributions";
    else if (status === "rejected") heading.textContent = "Rejected Contributions";
    else heading.textContent = "All Contribution Requests";
  }

  if (cachedAdminContributions) {
    renderAdminContributionsRows(cachedAdminContributions);
  }
}

// Render Contribution Requests Table Rows (Requirement 4)
function renderAdminContributionsRows(allContribs) {
  const tbody = document.getElementById("admin-contributions-table-body");
  if (!tbody || !allContribs) return;

  const filtered = allContribs.filter((c) => {
    if (activeContribFilter === "all") return true;
    return (c.status || "").toLowerCase() === activeContribFilter.toLowerCase();
  });

  if (filtered.length === 0) {
    const filterLabels = {
      all: "contribution requests",
      pending: "pending contribution requests",
      approved: "approved contributions",
      rejected: "rejected contributions"
    };
    const label = filterLabels[activeContribFilter] || "contributions";
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 32px 20px; text-align: center; color: var(--text-dim);">
          No ${label} found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((c) => {
      const statusVal = (c.status || "Pending").toLowerCase();
      const isPending = statusVal === "pending";
      const isApproved = statusVal === "approved";
      const isRejected = statusVal === "rejected";

      const statusBadge = isPending
        ? `<span class="status-pill pending">⏳ Pending</span>`
        : isApproved
        ? `<span class="status-pill approved">✓ Approved</span>`
        : `<span class="status-pill rejected">✕ Rejected</span>`;

      const submittedFormatted = formatDateTimeWithTz(c.submitted_at);

      return `
        <tr style="${isPending ? "background: #fffdf5;" : ""}">
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${escapeHtml(c.contributor_name || "Student")}</div>
            <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-dim); margin-top: 2px;">${escapeHtml(c.contributor_email || "-")}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${escapeHtml(c.resource_title)}</div>
            <div style="margin-top: 4px;">
              <span class="subject-badge" style="font-size: 10px; padding: 2px 7px;">${escapeHtml(c.category || "General")}</span>
              ${c.file_path ? `<span style="font-size: 11px; color: var(--blue-primary); margin-left: 6px;">📎 PDF</span>` : ""}
            </div>
          </td>
          <td>
            <div style="font-weight: 600; color: #1e3a8a; font-size: 12.5px;">${escapeHtml(c.existing_resource_title || c.existing_resource_id || "Coursework")}</div>
            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); margin-top: 1px;">ID: ${escapeHtml(c.existing_resource_id || "-")}</div>
          </td>
          <td>
            <div style="max-width: 260px; font-size: 12.5px; color: #334155; line-height: 1.45;">
              ${escapeHtml(c.description || "-")}
            </div>
            ${
              c.file_path
                ? `<div style="margin-top: 5px;"><a href="${c.file_path}" target="_blank" style="font-size: 11.5px; color: var(--blue-primary); font-weight: 600; text-decoration: none;">📎 View Submitted File</a></div>`
                : ""
            }
            ${
              c.contribution_content
                ? `<div style="margin-top: 5px; font-size: 11px; color: #475569; font-family: var(--font-mono); background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block;">📝 Notes included</div>`
                : ""
            }
          </td>
          <td>
            <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--text-main); line-height: 1.4;">
              ${submittedFormatted}
            </div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align: right; white-space: nowrap;">
            <div class="admin-table-actions" style="justify-content: flex-end; gap: 6px;">
              <button class="btn-secondary btn-sm" onclick="openContributionModal(${c.id})" title="View full details and notes">
                View Details
              </button>
              <button class="btn-success btn-sm" onclick="confirmApproveContribution(${c.id}, '${escapeHtml(c.resource_title)}', '${escapeHtml(c.contributor_name)}')" style="background: ${isApproved ? "#94a3b8" : "#059669"}; color: #ffffff; padding: 5px 12px; font-weight: 600; border: none; border-radius: 4px; cursor: ${isApproved ? "default" : "pointer"};" ${isApproved ? "disabled" : ""} title="${isApproved ? "Already approved and published" : "Approve and publish live to portal"}">
                ${isApproved ? "✓ Approved" : "Approve"}
              </button>
              <button class="btn-danger btn-sm" onclick="confirmRejectContribution(${c.id}, '${escapeHtml(c.resource_title)}', '${escapeHtml(c.contributor_name)}')" style="background: ${isRejected ? "#94a3b8" : "#dc2626"}; color: #ffffff; padding: 5px 11px; font-weight: 600; border: none; border-radius: 4px; cursor: ${isRejected ? "default" : "pointer"};" ${isRejected ? "disabled" : ""} title="${isRejected ? "Already rejected" : "Decline contribution"}">
                ${isRejected ? "✕ Rejected" : "Reject"}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

// Confirmation Dialog before Approving (Requirement 4)
async function confirmApproveContribution(id, title, contributorName) {
  const confirmed = confirm(
    `CONFIRM APPROVAL\n\n` +
    `Are you sure you want to approve this contribution?\n\n` +
    `• Resource: "${title}"\n` +
    `• Contributor: ${contributorName}\n\n` +
    `This will immediately publish the study material live to all students and send an approval confirmation email to the contributor.`
  );
  if (!confirmed) return;

  await approveContributionApi(id);
}

// Confirmation Dialog before Rejecting (Requirement 4)
async function confirmRejectContribution(id, title, contributorName) {
  const reason = prompt(
    `CONFIRM REJECTION\n\n` +
    `Are you sure you want to reject this contribution?\n\n` +
    `• Resource: "${title}"\n` +
    `• Contributor: ${contributorName}\n\n` +
    `Enter feedback or reason for rejection (this will be emailed to the contributor):`,
    "Content does not meet syllabus guidelines or duplicate submission."
  );

  if (reason === null) {
    return;
  }

  await rejectContributionApi(id, reason.trim());
}

async function approveContributionApi(id, adminFeedback = null) {
  try {
    const res = await fetch(`/api/admin/contributions/${id}/approve`, {
      method: "POST",
      headers: { ...getAdminAuthHeaders(), "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ adminFeedback })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || "✓ Contribution approved & published!");
      cachedAdminContributions = null;
      loadAdminContributionsTable(true);
      loadAdminResourcesTable();
      fetchResources();
      fetchLiveStats();
    } else {
      showToast(data.message || "Could not approve contribution.");
    }
  } catch (err) {
    console.error("Approve API error:", err);
    showToast("Network error while approving contribution.");
  }
}

async function rejectContributionApi(id, adminFeedback = null) {
  try {
    const res = await fetch(`/api/admin/contributions/${id}/reject`, {
      method: "POST",
      headers: { ...getAdminAuthHeaders(), "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ adminFeedback })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || "Contribution was rejected.");
      cachedAdminContributions = null;
      loadAdminContributionsTable(true);
      loadAdminResourcesTable();
      fetchResources();
      fetchLiveStats();
    } else {
      showToast(data.message || "Could not reject contribution.");
    }
  } catch (err) {
    console.error("Reject API error:", err);
    showToast("Network error while rejecting contribution.");
  }
}

// Open Contribution Details Modal (Requirement 4)
async function openContributionModal(id) {
  let contrib = null;
  if (cachedAdminContributions) {
    contrib = cachedAdminContributions.find((item) => String(item.id) === String(id));
  }

  if (!contrib) {
    try {
      const res = await fetch(`/api/admin/contributions/${id}`, {
        headers: getAdminAuthHeaders(),
        credentials: "same-origin"
      });
      const data = await res.json();
      if (res.ok && data.contribution) {
        contrib = data.contribution;
      }
    } catch (e) {
      console.error("Fetch modal contrib error:", e);
    }
  }

  if (!contrib) {
    showToast("Could not load contribution details.");
    return;
  }

  currentModalContrib = contrib;

  const modal = document.getElementById("contrib-details-modal");
  const statusBadge = document.getElementById("cdm-status-badge");
  const catBadge = document.getElementById("cdm-category");
  const idBadge = document.getElementById("cdm-id-badge");
  const titleEl = document.getElementById("cdm-title");
  const nameEl = document.getElementById("cdm-contributor-name");
  const emailEl = document.getElementById("cdm-contributor-email");
  const existResEl = document.getElementById("cdm-existing-resource");
  const existIdEl = document.getElementById("cdm-existing-id");
  const subTimeEl = document.getElementById("cdm-submission-time");
  const reviewMetaEl = document.getElementById("cdm-review-meta");
  const descEl = document.getElementById("cdm-description");
  const contentContainer = document.getElementById("cdm-content-container");
  const contentEl = document.getElementById("cdm-content");
  const fileContainer = document.getElementById("cdm-file-container");
  const fileNameEl = document.getElementById("cdm-file-name");
  const fileLinkEl = document.getElementById("cdm-file-download-link");
  const feedbackInput = document.getElementById("cdm-admin-feedback");
  const approveBtn = document.getElementById("cdm-approve-btn");
  const rejectBtn = document.getElementById("cdm-reject-btn");

  const statusVal = (contrib.status || "Pending").toLowerCase();
  if (statusBadge) {
    statusBadge.className = `status-pill ${statusVal}`;
    statusBadge.textContent = statusVal === "pending" ? "⏳ Pending Approval" : statusVal === "approved" ? "✓ Approved" : "✕ Rejected";
  }

  if (catBadge) catBadge.textContent = contrib.category || "General";
  if (idBadge) idBadge.textContent = `ID: #${contrib.id}`;
  if (titleEl) titleEl.textContent = contrib.resource_title;
  if (nameEl) nameEl.textContent = contrib.contributor_name || "Student";
  if (emailEl) emailEl.textContent = contrib.contributor_email || "-";
  if (existResEl) existResEl.textContent = contrib.existing_resource_title || contrib.existing_resource_id || "Coursework Module";
  if (existIdEl) existIdEl.textContent = `Target Resource ID: ${contrib.existing_resource_id || "-"}`;
  if (subTimeEl) subTimeEl.textContent = formatDateTimeWithTz(contrib.submitted_at);

  if (reviewMetaEl) {
    if (contrib.reviewed_at) {
      reviewMetaEl.textContent = `Reviewed on ${formatDateTimeWithTz(contrib.reviewed_at)} by ${contrib.reviewed_by || "Administrator"}`;
    } else {
      reviewMetaEl.textContent = "Awaiting review";
    }
  }

  if (descEl) descEl.textContent = contrib.description || "No description provided.";

  if (contentContainer && contentEl) {
    if (contrib.contribution_content && contrib.contribution_content.trim()) {
      contentContainer.style.display = "block";
      contentEl.textContent = contrib.contribution_content;
    } else {
      contentContainer.style.display = "none";
    }
  }

  if (fileContainer && fileLinkEl && fileNameEl) {
    if (contrib.file_path) {
      fileContainer.style.display = "block";
      fileLinkEl.href = contrib.file_path;
      fileNameEl.textContent = contrib.file_path.split("/").pop();
    } else {
      fileContainer.style.display = "none";
    }
  }

  if (feedbackInput) {
    feedbackInput.value = contrib.admin_feedback || "";
  }

  if (approveBtn) {
    approveBtn.style.display = statusVal === "approved" ? "none" : "inline-block";
  }
  if (rejectBtn) {
    rejectBtn.style.display = statusVal === "rejected" ? "none" : "inline-block";
  }

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeContributionModal() {
  const modal = document.getElementById("contrib-details-modal");
  if (modal) modal.style.display = "none";
  currentModalContrib = null;
}

// Modal Approve Handler
async function handleModalApproveClick() {
  if (!currentModalContrib) return;

  const feedbackInput = document.getElementById("cdm-admin-feedback");
  const feedback = feedbackInput ? feedbackInput.value.trim() : null;

  const confirmed = confirm(
    `CONFIRM APPROVAL\n\n` +
    `Approve contribution "${currentModalContrib.resource_title}"?\n\n` +
    `This will publish the study material live to all students.`
  );
  if (!confirmed) return;

  const contribId = currentModalContrib.id;
  closeContributionModal();
  await approveContributionApi(contribId, feedback);
}

// Modal Reject Handler
async function handleModalRejectClick() {
  if (!currentModalContrib) return;

  const feedbackInput = document.getElementById("cdm-admin-feedback");
  const feedback = feedbackInput && feedbackInput.value.trim() 
    ? feedbackInput.value.trim() 
    : "Declined by administrator.";

  const confirmed = confirm(
    `CONFIRM REJECTION\n\n` +
    `Reject contribution "${currentModalContrib.resource_title}"?\n\n` +
    `Feedback: "${feedback}"`
  );
  if (!confirmed) return;

  const contribId = currentModalContrib.id;
  closeContributionModal();
  await rejectContributionApi(contribId, feedback);
}

// Close modal on Escape
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("contrib-details-modal");
    if (modal && modal.style.display === "flex") {
      closeContributionModal();
    }
  }
});

function renderAdminUsersRows(users) {
  const tbody = document.getElementById("admin-users-table-body");
  const totalBadge = document.getElementById("admin-user-total-badge");
  if (!tbody || !users) return;

  if (totalBadge) totalBadge.textContent = `${users.length} Users`;

  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="padding: 24px; text-align: center; color: var(--text-dim);">
          No registered user accounts found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users
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
}

async function loadAdminUsersTable(forceFresh = false) {
  const tbody = document.getElementById("admin-users-table-body");
  if (!tbody) return;

  if (forceFresh) {
    isFetchingAdminUsers = false;
    cachedAdminUsers = null;
  }

  // 1. FAST PATH: Instant render from memory cache in 0 milliseconds
  if (cachedAdminUsers && !forceFresh) {
    renderAdminUsersRows(cachedAdminUsers);
  }

  if (isFetchingAdminUsers && !forceFresh) return;
  isFetchingAdminUsers = true;

  try {
    const url = forceFresh ? `/api/admin/users?fresh=true&_=${Date.now()}` : "/api/admin/users";
    const res = await fetch(url, {
      headers: { ...getAdminAuthHeaders(), "Cache-Control": forceFresh ? "no-cache" : "default" },
      credentials: "same-origin"
    });
    const data = await res.json();

    if (res.ok && data.users) {
      cachedAdminUsers = data.users;
      renderAdminUsersRows(cachedAdminUsers);
    } else {
      // Keep existing cached data rendered if available
      if (!cachedAdminUsers) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">
              <div style="margin-bottom: 8px;">${escapeHtml(data.message || "Failed to load directory.")}</div>
              <button class="btn-secondary btn-sm" onclick="refreshAdminUsersDirectory(this)">↻ Retry Loading</button>
            </td>
          </tr>
        `;
      }
    }
  } catch (err) {
    if (!cachedAdminUsers) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">
            <div style="margin-bottom: 8px;">Failed to connect to admin directory endpoint.</div>
            <button class="btn-secondary btn-sm" onclick="refreshAdminUsersDirectory(this)">↻ Retry Loading</button>
          </td>
        </tr>
      `;
    }
  } finally {
    isFetchingAdminUsers = false;
  }
}

async function refreshAdminUsersDirectory(btn) {
  let targetBtn = null;
  if (btn && btn.nodeType === 1) {
    targetBtn = btn.closest("button") || btn;
  } else {
    targetBtn = document.getElementById("btn-refresh-users");
  }
  const originalHtml = targetBtn ? targetBtn.innerHTML : "";

  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.innerHTML = `
      <span class="btn-spinner"></span>
      <span>Refreshing...</span>
    `;
  }

  try {
    cachedAdminUsers = null;
    await loadAdminUsersTable(true);
    showToast("✓ User directory refreshed.");
  } catch (e) {
    console.error("Refresh users error:", e);
    showToast("Failed to refresh user directory.");
  } finally {
    if (targetBtn) {
      targetBtn.disabled = false;
      targetBtn.innerHTML = originalHtml;
    }
  }
}

async function toggleUserRole(userId, newRole) {
  if (!confirm(`Change role of user ID #${userId} to ${newRole.toUpperCase()}?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "POST",
      headers: { ...getAdminAuthHeaders(), "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ role: newRole })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`User role updated to ${newRole.toUpperCase()}.`);
      cachedAdminUsers = null;
      loadAdminUsersTable(true);
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
      method: "DELETE",
      headers: getAdminAuthHeaders(),
      credentials: "same-origin"
    });
    const data = await res.json();
    if (res.ok) {
      showToast("User account removed.");
      cachedAdminUsers = null;
      loadAdminUsersTable(true);
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
  const pendingCounter = document.getElementById("admin-pending-counter");
  const pendingCard = document.getElementById("admin-pending-card");
  const pendingItemsList = document.getElementById("admin-pending-items-list");
  const pendingTextBadge = document.getElementById("admin-pending-text-badge");
  if (!tbody) return;

  try {
    const res = await fetch("/api/admin/resources", {
      headers: getAdminAuthHeaders(),
      credentials: "same-origin"
    });
    const data = await res.json();

    if (res.ok && data.resources) {
      adminResourcesList = data.resources;
      const pendingList = adminResourcesList.filter((r) => r.status === "pending");

      if (totalBadge) totalBadge.textContent = `${adminResourcesList.length} Modules`;

      // Pending counter badge in tab button
      if (pendingCounter) {
        if (pendingList.length > 0) {
          pendingCounter.textContent = `${pendingList.length} Pending`;
          pendingCounter.style.display = "inline-block";
        } else {
          pendingCounter.style.display = "none";
        }
      }

      // Pending review banner card at top of tab
      if (pendingCard && pendingItemsList) {
        if (pendingList.length > 0) {
          pendingCard.style.display = "block";
          if (pendingTextBadge) pendingTextBadge.textContent = `${pendingList.length} Pending Submissions`;

          pendingItemsList.innerHTML = pendingList
            .map((r) => {
              const createdStr = r.created_at ? new Date(r.created_at).toLocaleString() : "Just now";
              return `
                <div style="background: #ffffff; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 260px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                      <span class="subject-badge" style="font-size: 11px;">${escapeHtml(r.subject)}</span>
                      <strong style="color: var(--text-main); font-size: 15px;">${escapeHtml(r.title)}</strong>
                    </div>
                    <div style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 6px;">
                      Contributed by <strong style="color: var(--text-main);">${escapeHtml(r.uploader_name || "Student")}</strong> (${escapeHtml(r.uploader_email || "no-email")}) &bull; <span style="font-family: var(--font-mono); font-size: 11px;">${createdStr}</span>
                    </div>
                    <p style="font-size: 13px; color: #334155; margin: 0; line-height: 1.45; background: #f8fafc; padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-hairline);">
                      ${escapeHtml(r.summary || "")}
                    </p>
                    ${r.file_url ? `<div style="margin-top: 8px;"><a href="${r.file_url}" target="_blank" style="font-size: 12px; color: var(--blue-primary); text-decoration: underline; font-weight: 600;">📎 Download Attached Contribution File</a></div>` : ""}
                  </div>
                  <div style="display: flex; gap: 8px; align-items: center; white-space: nowrap;">
                    <button class="btn-secondary btn-sm" onclick="openNotesModal('${r.id}')" title="Preview study material">
                      View
                    </button>
                    <button class="btn-success btn-sm" onclick="approveResourceItem('${r.id}', '${escapeHtml(r.title)}')" style="background: #059669; color: #fff; padding: 7px 15px; font-weight: 600; border: none; border-radius: 6px; cursor: pointer;" title="Approve and publish live to all students">
                      ✓ Approve &amp; Publish
                    </button>
                    <button class="btn-danger btn-sm" onclick="rejectResourceItem('${r.id}', '${escapeHtml(r.title)}')" style="padding: 7px 14px;" title="Decline this contribution">
                      ✕ Reject
                    </button>
                  </div>
                </div>
              `;
            })
            .join("");
        } else {
          pendingCard.style.display = "none";
        }
      }

      if (adminResourcesList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 24px;">No coursework documents found in repository.</td></tr>`;
        return;
      }

      tbody.innerHTML = adminResourcesList
        .map((r) => {
          const statusVal = r.status || "approved";
          const isPending = statusVal === "pending";
          const isRejected = statusVal === "rejected";
          const statusBadge = isPending
            ? `<span class="status-badge pending">⏳ Pending Approval</span>`
            : isRejected
            ? `<span class="status-badge failed">✕ Rejected</span>`
            : `<span class="status-badge delivered">✓ Approved</span>`;

          const createdDate = r.created_at ? new Date(r.created_at).toLocaleDateString() : "-";

          return `
            <tr style="${isPending ? "background: #fffbeb;" : ""}">
              <td style="font-weight: 600; color: var(--text-main);">
                <div>${escapeHtml(r.title)}</div>
                ${r.file_url ? `<a href="${r.file_url}" target="_blank" style="font-size: 11px; color: var(--blue-primary); text-decoration: underline;">Attachment Link</a>` : ""}
              </td>
              <td><span class="subject-badge">${escapeHtml(r.subject)}</span></td>
              <td style="font-size: 13px;">
                <div><strong>${escapeHtml(r.uploader_name || "Faculty")}</strong></div>
                <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim);">${escapeHtml(r.uploader_email || "")}</div>
              </td>
              <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-dim);">${createdDate}</td>
              <td>${statusBadge}</td>
              <td style="text-align: right;">
                <div class="admin-table-actions" style="justify-content: flex-end;">
                  ${
                    isPending
                      ? `
                      <button class="btn-success btn-sm" onclick="approveResourceItem('${r.id}', '${escapeHtml(r.title)}')" style="background: #059669; color: #fff; padding: 4px 10px; border: none; border-radius: 4px; cursor: pointer;" title="Approve">
                        Approve
                      </button>
                      <button class="btn-danger btn-sm" onclick="rejectResourceItem('${r.id}', '${escapeHtml(r.title)}')" style="padding: 4px 10px;" title="Reject">
                        Reject
                      </button>
                      `
                      : isRejected
                      ? `
                      <button class="btn-success btn-sm" onclick="approveResourceItem('${r.id}', '${escapeHtml(r.title)}')" style="background: #059669; color: #fff; padding: 4px 10px; border: none; border-radius: 4px; cursor: pointer;" title="Re-approve">
                        Re-Approve
                      </button>
                      `
                      : ""
                  }
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
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">${data.message || "Failed to load directory."}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: var(--accent-red);">Failed to connect to admin endpoint.</td></tr>`;
  }
}

async function approveResourceItem(resourceId, title) {
  try {
    const res = await fetch(`/api/admin/resources/${resourceId}/approve`, {
      method: "POST",
      headers: { ...getAdminAuthHeaders(), "Content-Type": "application/json" },
      credentials: "same-origin"
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`✓ "${title}" approved & published to portal!`);
      loadAdminResourcesTable();
      fetchResources();
      fetchLiveStats();
    } else {
      showToast(data.message || "Could not approve resource.");
    }
  } catch (e) {
    showToast("Error connecting to server.");
  }
}

async function rejectResourceItem(resourceId, title) {
  if (!confirm(`Reject contribution "${title}"? It will not be published to students.`)) return;

  try {
    const res = await fetch(`/api/admin/resources/${resourceId}/reject`, {
      method: "POST",
      headers: { ...getAdminAuthHeaders(), "Content-Type": "application/json" },
      credentials: "same-origin"
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`Contribution "${title}" was rejected.`);
      loadAdminResourcesTable();
      fetchResources();
      fetchLiveStats();
    } else {
      showToast(data.message || "Could not reject resource.");
    }
  } catch (e) {
    showToast("Error connecting to server.");
  }
}

async function deleteResourceItem(resourceId, title) {
  if (!confirm(`Delete resource module "${title}"?`)) return;

  try {
    const res = await fetch(`/api/admin/resources/${resourceId}`, {
      method: "DELETE",
      headers: getAdminAuthHeaders(),
      credentials: "same-origin"
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

function renderAdminNotificationsRows(notifications) {
  const tbody = document.getElementById("admin-notifications-table-body");
  const totalBadge = document.getElementById("admin-notif-total-badge");
  const counterBadge = document.getElementById("admin-notif-counter");
  const telemetryBadge = document.getElementById("admin-notif-stat-count");
  if (!tbody || !notifications) return;

  const count = notifications.length;
  if (totalBadge) totalBadge.textContent = `${count} Alert${count === 1 ? "" : "s"}`;
  if (counterBadge) counterBadge.textContent = count;
  if (telemetryBadge) telemetryBadge.textContent = count;

  if (count === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 24px; text-align: center; color: var(--text-dim);">
          No alerts dispatched yet. New notifications will appear automatically here as users register or contribute.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = notifications
    .map((n) => {
      const isDelivered = n.status === "delivered";
      const isFailed = n.status && n.status.startsWith("failed");
      const badgeClass = isDelivered ? "delivered" : (isFailed ? "failed" : "logged");
      const badgeText = isDelivered ? "DELIVERED TO INBOX" : (isFailed ? "FAILED" : "DISPATCHED & LOGGED");

      let detailsObj = {};
      try {
        detailsObj = typeof n.details === "string" ? JSON.parse(n.details) : (n.details || {});
      } catch (e) {}

      const isContribution = n.type === "resource_contributed";
      const typeBadge = isContribution
        ? `<span class="status-badge pending" style="font-size: 9.5px; padding: 2px 7px;">📝 CONTRIBUTION</span>`
        : `<span class="status-badge logged" style="font-size: 9.5px; padding: 2px 7px;">👤 REGISTRATION</span>`;

      const subjectName = detailsObj.subject || detailsObj.category || "General";
      const existingResInfo = detailsObj.existingResource
        ? `<div style="font-size: 11px; color: #1e3a8a; margin-top: 2px; font-weight: 600;">Target: ${escapeHtml(detailsObj.existingResource)}</div>`
        : "";

      const eventDetails = isContribution
        ? `
          <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">${escapeHtml(detailsObj.title || "Study Material")}</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">Subject: <span class="subject-badge" style="font-size: 10px; padding: 1px 6px;">${escapeHtml(subjectName)}</span> ${detailsObj.fileUrl ? "• 📎 Attached File" : ""}</div>
          ${existingResInfo}
        `
        : `
          <div style="font-weight: 700; color: var(--text-main); font-size: 13px;">New User Registration</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">Role: <span class="role-badge ${n.user_role === 'admin' ? 'admin' : 'user'}" style="font-size: 9px;">${escapeHtml(n.user_role || 'user')}</span></div>
        `;

      const formattedDateTime = formatDateTimeWithTz(n.registered_at);

      return `
        <tr style="${isContribution ? "background: #fafaf9;" : ""}">
          <td style="font-family: var(--font-mono); color: var(--text-dim); font-size: 12px;">#${n.id}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
              ${typeBadge}
            </div>
            ${eventDetails}
          </td>
          <td>
            <strong style="color: var(--text-main); font-size: 13.5px;">${escapeHtml(n.user_name || "Student")}</strong>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 12.5px; color: var(--text-main);">${escapeHtml(n.user_email)}</span>
          </td>
          <td>
            <div style="font-size: 12px; color: var(--text-main); font-weight: 600; line-height: 1.4;">${formattedDateTime}</div>
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
}

async function loadAdminNotificationsTable(forceFresh = false) {
  const tbody = document.getElementById("admin-notifications-table-body");
  const targetEmailDisplay = document.getElementById("admin-target-email-display");
  const targetEmailInline = document.getElementById("admin-target-email-inline");
  const engineStatusDisplay = document.getElementById("admin-email-engine-status");
  if (!tbody) return;

  if (forceFresh) {
    isFetchingAdminNotifs = false;
    cachedAdminNotifications = null;
    tbody.style.opacity = "0.55";
    tbody.style.transition = "opacity 0.2s ease";
  }

  // 1. FAST PATH: Render immediately from memory cache (0 milliseconds)
  if (cachedAdminNotifications && !forceFresh) {
    renderAdminNotificationsRows(cachedAdminNotifications);
  }

  // 2. Refresh email engine status in background
  fetch("/api/admin/email-status", {
    headers: getAdminAuthHeaders(),
    credentials: "same-origin"
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.success && data.status) {
        if (targetEmailDisplay) targetEmailDisplay.textContent = data.status.adminEmail;
        if (targetEmailInline) targetEmailInline.textContent = data.status.adminEmail;
        if (engineStatusDisplay) {
          engineStatusDisplay.textContent = data.status.isConfigured
            ? `Live SMTP (${data.status.sender})`
            : "Nodemailer (Active / Logging)";
        }
      }
    })
    .catch(() => {});

  if (isFetchingAdminNotifs && !forceFresh) return;
  isFetchingAdminNotifs = true;

  try {
    const url = forceFresh ? `/api/admin/notifications?fresh=true&_=${Date.now()}` : "/api/admin/notifications";
    const res = await fetch(url, {
      headers: { ...getAdminAuthHeaders(), "Cache-Control": forceFresh ? "no-cache" : "default" },
      credentials: "same-origin"
    });
    const data = await res.json();

    if (res.ok && data.notifications) {
      cachedAdminNotifications = data.notifications;
      renderAdminNotificationsRows(cachedAdminNotifications);
      fetchLiveStats(false);
      return true;
    } else {
      const errMsg = (data && data.message) || "Failed to load notifications.";
      if (!cachedAdminNotifications) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="padding: 24px; text-align: center; color: var(--accent-red);">
              <div style="margin-bottom: 8px;">${escapeHtml(errMsg)}</div>
              <button class="btn-secondary btn-sm" onclick="refreshAdminNotificationsLog(this)">↻ Retry Loading</button>
            </td>
          </tr>
        `;
      }
      return false;
    }
  } catch (err) {
    if (!cachedAdminNotifications) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 24px; text-align: center; color: var(--accent-red);">
            <div style="margin-bottom: 8px;">${escapeHtml(err.message || "Failed to connect to notifications service.")}</div>
            <button class="btn-secondary btn-sm" onclick="refreshAdminNotificationsLog(this)">↻ Retry Loading</button>
          </td>
        </tr>
      `;
    }
    return false;
  } finally {
    isFetchingAdminNotifs = false;
    if (tbody) tbody.style.opacity = "1";
  }
}

async function refreshAdminNotificationsLog(btn) {
  let targetBtn = null;
  if (btn && btn.nodeType === 1) {
    targetBtn = btn.closest("button") || btn;
  } else {
    targetBtn = document.getElementById("btn-refresh-notifs");
  }
  const originalHtml = targetBtn ? targetBtn.innerHTML : "";

  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.innerHTML = `
      <span class="btn-spinner" style="display: inline-block; width: 14px; height: 14px; border: 2px solid currentColor; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 6px;"></span>
      <span>Refreshing Log...</span>
    `;
  }

  try {
    cachedAdminNotifications = null;
    const ok = await loadAdminNotificationsTable(true);
    if (ok) {
      showToast("✓ Admin notifications log refreshed successfully.");
    } else {
      showToast("Could not refresh notifications log.");
    }
  } catch (e) {
    console.error("Refresh log error:", e);
    showToast(e.message || "Failed to refresh notifications log.");
  } finally {
    if (targetBtn) {
      targetBtn.disabled = false;
      targetBtn.innerHTML = originalHtml;
    }
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
      headers: { ...getAdminAuthHeaders(), "Content-Type": "application/json" },
      credentials: "same-origin"
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || "Test registration alert dispatched to admin mailbox!");
      cachedAdminNotifications = null;
      loadAdminNotificationsTable(true);
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

async function triggerTestContributionNotification() {
  const btn = document.getElementById("btn-test-contrib-email");
  const originalHtml = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <span class="btn-spinner" style="display: inline-block; width: 14px; height: 14px; border: 2px solid #555; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 6px;"></span>
      <span>Dispatching Alert...</span>
    `;
  }

  try {
    const res = await fetch("/api/admin/notifications/test-contribution", {
      method: "POST",
      headers: { ...getAdminAuthHeaders(), "Content-Type": "application/json" },
      credentials: "same-origin"
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(data.message || "Test contribution alert dispatched to admin mailbox!");
      cachedAdminNotifications = null;
      loadAdminNotificationsTable(true);
    } else {
      showToast(data.message || "Failed to dispatch test contribution alert.");
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
  const userEl = document.getElementById("smtp-sender-email");
  const passEl = document.getElementById("smtp-app-password");
  if (!userEl || !passEl) return;

  const user = userEl.value.trim();
  const pass = passEl.value.trim();
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

      // Sync Admin Pending Contribution Notification Badges & Banner (Requirement 2)
      const pendingContrib = typeof stats.pendingContributions !== "undefined" ? stats.pendingContributions : 0;
      const navBadge = document.getElementById("nav-admin-pending-badge");
      const mobBadge = document.getElementById("mob-admin-pending-badge");
      const alertBanner = document.getElementById("admin-new-contrib-alert-banner");
      const alertSub = document.getElementById("admin-new-contrib-alert-sub");
      const adminContribCounter = document.getElementById("admin-contrib-counter");

      const currentUser = getCurrentUser();
      const isAdminUser = currentUser && currentUser.role === "admin";

      if (navBadge) {
        if (pendingContrib > 0 && isAdminUser) {
          navBadge.textContent = pendingContrib;
          navBadge.style.display = "inline-flex";
        } else {
          navBadge.style.display = "none";
        }
      }

      if (mobBadge) {
        if (pendingContrib > 0 && isAdminUser) {
          mobBadge.textContent = pendingContrib;
          mobBadge.style.display = "inline-block";
        } else {
          mobBadge.style.display = "none";
        }
      }

      if (alertBanner) {
        if (pendingContrib > 0 && isAdminUser) {
          alertBanner.style.display = "block";
          if (alertSub) {
            alertSub.textContent = `${pendingContrib} pending contribution request${pendingContrib === 1 ? "" : "s"} require administrator review.`;
          }
        } else {
          alertBanner.style.display = "none";
        }
      }

      if (adminContribCounter) {
        if (pendingContrib > 0) {
          adminContribCounter.textContent = `${pendingContrib} Pending`;
          adminContribCounter.style.display = "inline-block";
        } else {
          adminContribCounter.style.display = "none";
        }
      }

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

// Explicitly register on global window scope
window.refreshAdminNotificationsLog = refreshAdminNotificationsLog;
window.refreshAdminUsersDirectory = refreshAdminUsersDirectory;
window.loadAdminNotificationsTable = loadAdminNotificationsTable;
window.loadAdminUsersTable = loadAdminUsersTable;
window.refreshAdminContributions = refreshAdminContributions;
window.loadAdminContributionsTable = loadAdminContributionsTable;
window.filterContributionsByStatus = filterContributionsByStatus;
window.openContributionModal = openContributionModal;
window.closeContributionModal = closeContributionModal;
window.confirmApproveContribution = confirmApproveContribution;
window.confirmRejectContribution = confirmRejectContribution;
window.handleModalApproveClick = handleModalApproveClick;
window.handleModalRejectClick = handleModalRejectClick;
window.filterExistingResourcesDropdown = filterExistingResourcesDropdown;
window.populateExistingResourcesDropdown = populateExistingResourcesDropdown;
window.initUploadPage = initUploadPage;
window.handleFileSelected = handleFileSelected;
window.handleUploadSubmit = handleUploadSubmit;
window.switchAdminTab = switchAdminTab;
window.switchUploadTab = switchUploadTab;
window.loadUserSubmittedRequests = loadUserSubmittedRequests;