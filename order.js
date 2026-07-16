(function () {
  "use strict";

  var productSelect = document.getElementById("product");
  var orderForm = document.getElementById("orderForm");
  var orderSuccess = document.getElementById("orderSuccess");

  var categoryGroups = document.querySelectorAll("[data-category]");

  var productCategoryMap = {
    "Articulated Gauntlet": ["gauntlet", "cast-correction"],
    "Standard Leather Gauntlet": ["gauntlet", "cast-correction"],
    "Tall Gauntlet": ["gauntlet", "cast-correction"],
    "Balance Brace": ["gauntlet", "cast-correction"],
    "Extended Half and Half": ["gauntlet", "cast-correction"],
    "Extended Unweighting": ["gauntlet", "cast-correction"],
    "Traditional Solid": ["thermoplastic", "cast-correction"],
    "Traditional Articulated": ["thermoplastic", "cast-correction"],
    "Active Overlap": ["thermoplastic", "cast-correction"],
    "Active Split Upright": ["thermoplastic", "cast-correction"],
    "Hybrid Boot": ["boot", "cast-correction"],
    "Partial Boot": ["boot", "cast-correction"],
    "Tampa Boot": ["boot", "cast-correction"],
    "Crow Boot": ["crow", "cast-correction"],
    "Partial Foot": ["partial-foot", "cast-correction"],
    "Shoe Modification": ["shoe-mod"]
  };

  function updateProductOptions() {
    var product = productSelect.value;
    var categories = productCategoryMap[product] || [];

    categoryGroups.forEach(function (group) {
      var category = group.getAttribute("data-category");
      if (categories.indexOf(category) !== -1) {
        group.removeAttribute("hidden");
      } else {
        group.setAttribute("hidden", "");
      }
    });

    // Show/hide trim line vs hinge for thermoplastic
    var thermoTrim = document.getElementById("thermoTrimGroup");
    var thermoHinge = document.getElementById("thermoHingeGroup");
    if (thermoTrim && thermoHinge) {
      if (product === "Traditional Solid") {
        thermoTrim.removeAttribute("hidden");
        thermoHinge.setAttribute("hidden", "");
      } else if (product === "Traditional Articulated") {
        thermoTrim.setAttribute("hidden", "");
        thermoHinge.removeAttribute("hidden");
      } else if (product === "Active Overlap" || product === "Active Split Upright") {
        thermoTrim.setAttribute("hidden", "");
        thermoHinge.setAttribute("hidden", "");
      } else {
        thermoTrim.setAttribute("hidden", "");
        thermoHinge.setAttribute("hidden", "");
      }
    }
  }

  if (productSelect) {
    productSelect.addEventListener("change", updateProductOptions);
  }

  // Form validation and submission
  function validateRequired(field) {
    var errorEl = document.getElementById(field.id + "-error");
    if (!errorEl) return true;
    if (!field.value || field.value.trim() === "") {
      errorEl.textContent = "This field is required.";
      field.classList.add("error");
      field.classList.remove("success");
      return false;
    }
    errorEl.textContent = "";
    field.classList.remove("error");
    field.classList.add("success");
    return true;
  }

  // Create error span for required fields
  var requiredFields = orderForm.querySelectorAll("[required]");
  requiredFields.forEach(function (field) {
    var errorSpan = document.createElement("span");
    errorSpan.className = "form-error";
    errorSpan.id = field.id + "-error";
    errorSpan.setAttribute("role", "alert");
    errorSpan.setAttribute("aria-live", "polite");
    field.parentNode.appendChild(errorSpan);

    field.addEventListener("blur", function () {
      validateRequired(field);
    });
    field.addEventListener("input", function () {
      var errorEl = document.getElementById(field.id + "-error");
      if (errorEl && errorEl.textContent) {
        validateRequired(field);
      }
    });
  });

  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var isValid = true;
      requiredFields.forEach(function (field) {
        if (!validateRequired(field)) {
          isValid = false;
        }
      });

      // Validate product-specific required fields
      var product = productSelect.value;
      if (!product) {
        isValid = false;
      }

      if (!isValid) {
        var firstError = orderForm.querySelector(".error");
        if (firstError) firstError.focus();
        return;
      }

      // Submit via Formspree
      var formData = new FormData(orderForm);
      var xhr = new XMLHttpRequest();
      xhr.open("POST", orderForm.action, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
          orderForm.style.display = "none";
          if (orderSuccess) {
            orderSuccess.hidden = false;
            orderSuccess.focus();
          }
        } else {
          alert("There was a problem submitting your order. Please try again or email us directly at elegantafo@gmail.com.");
        }
      };
      xhr.onerror = function () {
        alert("There was a problem submitting your order. Please check your internet connection and try again.");
      };
      xhr.send(formData);
    });
  }

  // Initialize on page load
  updateProductOptions();
})();
