(function(){
  // Small routing shim to enforce registration -> login -> home flow
  // and to guard protected pages without changing existing UI or server logic.

  function whenShowPageReady(cb) {
    if (typeof window.showPage === 'function') return cb();
    var tries = 0;
    var id = setInterval(function(){
      tries++;
      if (typeof window.showPage === 'function' || tries > 100) {
        clearInterval(id);
        cb();
      }
    }, 40);
  }

  function isLoggedIn() {
    return localStorage.getItem('learnhub_isLoggedIn') === 'true';
  }
  function markLoggedIn() {
    localStorage.setItem('learnhub_isLoggedIn','true');
  }

  // Keep a flag when a user just registered; the register submit handler sets this.
  function markJustRegistered() {
    localStorage.setItem('learnhub_justRegistered','true');
  }

  function clearJustRegistered() {
    localStorage.removeItem('learnhub_justRegistered');
  }

  // Observe UI changes that indicate a successful login (nav-logout becomes visible)
  function observeLoginSuccess() {
    var navLogout = document.getElementById('nav-logout');
    if (!navLogout) return;

    // If already visible, consider user logged in
    try {
      var style = window.getComputedStyle(navLogout);
      if (style && style.display !== 'none') {
        markLoggedIn();
      }
    } catch(e){}

    var observer = new MutationObserver(function(){
      var visible = window.getComputedStyle(navLogout).display !== 'none';
      if (visible && !isLoggedIn()) {
        // The existing app/logic just logged the user in and revealed the logout link.
        markLoggedIn();
        // Navigate to home after login (preserve existing handlers)
        if (typeof window._originalShowPage === 'function') {
          window._originalShowPage('home');
        }
      }
    });

    observer.observe(navLogout, { attributes: true, attributeFilter: ['style','class'] });
  }

  whenShowPageReady(function(){
    // Capture original showPage so we can wrap it without altering behavior.
    if (!window._originalShowPage) {
      window._originalShowPage = window.showPage.bind(window);
    }

    // Protect specific pages unless logged in. Add or remove page ids from this set if needed.
    var protectedPages = new Set(['upload','admin']);

    // Override showPage to enforce protection and to clear/register flags safely.
    window.showPage = function(page) {
      // If the app calls showPage with an element or event, try to normalize
      if (!page || typeof page !== 'string') {
        return window._originalShowPage(page);
      }

      // If user is not logged in and requests a protected page, redirect to login instead.
      if (protectedPages.has(page) && !isLoggedIn()) {
        // Send them to login. Do not break anything else.
        return window._originalShowPage('login');
      }

      // If navigating to login and we had a just-registered flag, clear it (we'll land on login intentionally).
      if (page === 'login' && localStorage.getItem('learnhub_justRegistered') === 'true') {
        clearJustRegistered();
      }

      return window._originalShowPage(page);
    };

    // Wire the register form to mark that a registration attempt occurred.
    var registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', function(){
        // Set a lightweight flag; the actual registration logic in the app remains unchanged.
        markJustRegistered();
      }, true);
    }

    // When the page loads (or on script run), decide the initial page to show with minimal interference.
    function initialRouting() {
      // If already logged in, show home.
      if (isLoggedIn()) {
        window._originalShowPage('home');
        return;
      }

      // If user just completed registration, show login.
      if (localStorage.getItem('learnhub_justRegistered') === 'true') {
        // Clear the flag (we only want this to apply once) and go to login.
        clearJustRegistered();
        window._originalShowPage('login');
        return;
      }

      // Default for new visitors: show the register page first.
      window._originalShowPage('register');
    }

    // Run initial routing now (if document already loaded) or on DOMContentLoaded.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){
        initialRouting();
        observeLoginSuccess();
      });
    } else {
      initialRouting();
      observeLoginSuccess();
    }
  });

})();
