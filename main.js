/* ============================================================
   ELEGANT AFO ORTHOTICS - MAIN JAVASCRIPT
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     1. DOM REFERENCES
     ---------------------------------------------------------- */
  const html = document.documentElement;
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
    document.body.style.overflow = "";
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", toggleMobileMenu);
  }

  // Close mobile menu when a nav link is clicked
  navLinkItems.forEach(function (link) {
    link.addEventListener("click", closeMobileMenu);
  });

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
    apptDate: function (value) {
      if (!value) return "Please select an appointment date.";
      const selected = new Date(value + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) return "Appointment date cannot be in the past.";
      return "";
    },
    condition: function (value) {
      if (!value) return "Please select your primary condition.";
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
        // Focus first error field
        var firstError = appointmentForm.querySelector(".error");
        if (firstError) firstError.focus();
        return;
      }

      // Simulate successful submission
      appointmentForm.style.display = "none";
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.focus();
      }
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
  var header = document.querySelector(".site-header");
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
