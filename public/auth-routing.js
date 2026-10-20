(function () {
"use strict";

function whenShowPageReady(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, {
            once: true
        });
    } else {
        callback();
    }
}

function isLoggedIn() {
    return localStorage.getItem("learnhub_logged_in") === "true";
}

function showPageSafely(pageName) {
    var protectedPages = ["upload", "admin"];

    if (protectedPages.includes(pageName) && !isLoggedIn()) {
        pageName = "login";
    }

    if (typeof window.showPage === "function") {
        window.showPage(pageName);
        return;
    }

    document.querySelectorAll(".page").forEach(function (page) {
        page.classList.remove("active");
    });

    var target = document.getElementById(pageName);

    if (target) {
        target.classList.add("active");
    }
}

whenShowPageReady(function () {
    // Make password visibility buttons work.
    document.querySelectorAll(".password-toggle").forEach(function (button) {
        button.addEventListener("click", function () {
            var input = document.getElementById(
                button.getAttribute("data-password-target")
            );

            if (!input) return;

            var shouldShow = input.type === "password";

            input.type = shouldShow ? "text" : "password";
            button.textContent = shouldShow ? "Hide" : "Show";
            button.setAttribute("aria-pressed", String(shouldShow));
        });
    });

    // Do not override the existing registration form handler.
    var registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", function () {
            // The registration handler in app.js handles account creation.
        });
    }

    // Keep the initial page selection simple.
    var loggedIn = isLoggedIn();
    var justRegistered =
        localStorage.getItem("learnhub_justRegistered") === "true";

    if (loggedIn) {
        showPageSafely("home");
    } else if (justRegistered) {
        showPageSafely("login");
    } else {
        showPageSafely("register");
    }
});

})();
