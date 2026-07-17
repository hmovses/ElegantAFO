/* ============================================================
   ELEGANT AFO ORTHOTICS - MAIN JAVASCRIPT
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. DOM REFERENCES
     ---------------------------------------------------------- */
  const html = document.documentElement;
  const header = document.querySelector(".site-header");
  const themeToggle = document.getElementById("themeToggle");
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.getElementById("primary-nav");
  const navLinkItems = document.querySelectorAll(".nav-link");
  const appointmentForm = document.getElementById("appointmentForm");
  const formSuccess = document.getElementById("formSuccess");

  /* ----------------------------------------------------------
     2. DARK MODE / LIGHT MODE TOGGLE
     ---------------------------------------------------------- */
  const STORAGE_KEY = "elegant-afo-theme";

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleLabel(theme);
  }

  function updateToggleLabel(theme) {
    if (!themeToggle) return;
    const label =
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", label);
  }

  // Initialise theme
  applyTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const current = html.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  // Listen for OS-level changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });

  /* ----------------------------------------------------------
     3. MOBILE NAVIGATION MENU
     ---------------------------------------------------------- */
  function toggleMobileMenu() {
    const isOpen = mobileMenuBtn.getAttribute("aria-expanded") === "true";
    mobileMenuBtn.setAttribute("aria-expanded", String(!isOpen));
    navLinks.classList.toggle("is-open");
    header.classList.toggle("menu-open");

    // Trap focus or prevent scroll when open
    if (!isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  function closeMobileMenu() {
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
    header.classList.remove("menu-open");
    document.body.style.overflow = "";
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }

  // Close mobile menu when a nav link is clicked
  navLinkItems.forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });

  /* ----------------------------------------------------------
     3.5 NAV DROPDOWN
     ---------------------------------------------------------- */
  var dropdownToggle = document.querySelector(".nav-dropdown-toggle");
  var dropdownMenu = document.querySelector(".nav-dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var expanded = dropdownToggle.getAttribute("aria-expanded") === "true";
      dropdownToggle.setAttribute("aria-expanded", String(!expanded));
      dropdownMenu.setAttribute("aria-hidden", expanded ? "true" : "false");
    });

    // Close on Escape
    dropdownToggle.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdownToggle.setAttribute("aria-expanded", "false");
        dropdownMenu.setAttribute("aria-hidden", "true");
        dropdownToggle.focus();
      }
    });

    // Close when a dropdown link is clicked
    dropdownMenu.querySelectorAll(".nav-dropdown-link").forEach(function (link) {
      link.addEventListener("click", function () {
        dropdownToggle.setAttribute("aria-expanded", "false");
        dropdownMenu.setAttribute("aria-hidden", "true");
        closeMobileMenu();
      });
    });

    // Close on click outside
    document.addEventListener("click", function (e) {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownToggle.setAttribute("aria-expanded", "false");
        dropdownMenu.setAttribute("aria-hidden", "true");
      }
    });
  }

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("is-open")) {
      closeMobileMenu();
      mobileMenuBtn.focus();
    }
  });

  /* ----------------------------------------------------------
     4. ACTIVE NAVIGATION HIGHLIGHTING
     ---------------------------------------------------------- */
  const sections = document.querySelectorAll("section[id]");

  function highlightActiveNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollY >= top && scrollY < top + height) {
        navLinkItems.forEach(function (link) {
          link.classList.remove("is-active");
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("is-active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", highlightActiveNav, { passive: true });
  highlightActiveNav();

  /* ----------------------------------------------------------
     6. APPOINTMENT FORM VALIDATION
     ---------------------------------------------------------- */
  const validators = {
    fullName: function (value) {
      if (!value.trim()) return "Please enter your full name.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
      return "";
    },
    email: function (value) {
      if (!value.trim()) return "Please enter your email address.";
      // Basic but robust email regex
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Please enter a valid email address.";
      return "";
    },
    phone: function (value) {
      if (!value.trim()) return "Please enter your phone number.";
      // Strip non-digits and check length
      const digits = value.replace(/\D/g, "");
      if (digits.length < 10) return "Phone number must be at least 10 digits.";
      return "";
    },
    message: function (value) {
      if (!value.trim()) return "Please enter your message.";
      return "";
    },
  };

  function validateField(name) {
    const field = appointmentForm.elements[name];
    const errorEl = document.getElementById(name + "-error");
    if (!field || !errorEl) return true;

    const validator = validators[name];
    if (!validator) return true;

    const errorMsg = validator(field.value);
    errorEl.textContent = errorMsg;

    // Visual state
    field.classList.remove("error", "success");
    if (errorMsg) {
      field.classList.add("error");
      field.setAttribute("aria-invalid", "true");
      return false;
    } else {
      if (field.value.trim()) field.classList.add("success");
      field.setAttribute("aria-invalid", "false");
      return true;
    }
  }

  // Real-time validation on blur
  if (appointmentForm) {
    var fieldNames = Object.keys(validators);
    fieldNames.forEach(function (name) {
      var field = appointmentForm.elements[name];
      if (field) {
        field.addEventListener("blur", function () {
          validateField(name);
        });
        // Clear error on input
        field.addEventListener("input", function () {
          var errorEl = document.getElementById(name + "-error");
          if (errorEl && errorEl.textContent) {
            validateField(name);
          }
        });
      }
    });

    // Form submit
    appointmentForm.addEventListener("submit", function (e) {
      e.preventDefault();

      let isValid = true;
      fieldNames.forEach(function (name) {
        if (!validateField(name)) {
          isValid = false;
        }
      });

      if (!isValid) {
        var firstError = appointmentForm.querySelector(".error");
        if (firstError) firstError.focus();
        return;
      }

      var fd = new FormData(appointmentForm);
      var data = {};
      fd.forEach(function (v, k) { data[k] = v; });

      var xhr = new XMLHttpRequest();
      xhr.open("POST", appointmentForm.action, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201 || xhr.status === 202) {
          appointmentForm.style.display = "none";
          if (formSuccess) {
            formSuccess.hidden = false;
            formSuccess.focus();
          }
        } else {
          alert("There was a problem sending your message. Please try again or email us directly at elegantafo@gmail.com.");
        }
      };
      xhr.onerror = function () {
        alert("There was a problem sending your message. Please check your internet connection and try again.");
      };
      xhr.send(JSON.stringify(data));
    });
  }

  /* ----------------------------------------------------------
     7. SMOOTH SCROLL FALLBACK (for older browsers)
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Update URL hash without jump
        history.pushState(null, "", targetId);
      }
    });
  });

  /* ----------------------------------------------------------
     8. HEADER SCROLL EFFECT
     ---------------------------------------------------------- */
  var lastScroll = 0;

  function onScroll() {
    var currentScroll = window.scrollY;
    if (currentScroll > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
    lastScroll = currentScroll;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
