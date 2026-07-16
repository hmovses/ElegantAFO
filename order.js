(function () {
  "use strict";

  var formCards = document.querySelectorAll(".form-card");
  var formSections = document.querySelectorAll(".form-section");
  var formWrapper = document.getElementById("orderFormWrapper");
  var orderForm = document.getElementById("orderForm");
  var orderSuccess = document.getElementById("orderSuccess");
  var formSubject = document.getElementById("formSubject");
  var formTypeInput = document.getElementById("formTypeInput");
  var selectedFormName = document.getElementById("selectedFormName");
  var downloadBlankLink = document.getElementById("downloadBlankLink");
  var downloadPdfBtn = document.getElementById("downloadPdfBtn");

  var FORM_NAMES = {
    gauntlet: "Gauntlet Order Form",
    thermoplastic: "Thermoplastic AFO Order Form",
    bootline: "Bootline Order Form",
    crow: "Crow Boot Order Form",
    shoe: "Shoe Modification Order Form"
  };

  var FORM_BLANK_PDFS = {
    gauntlet: "Order forms/Gauntlet Order Form (Fillable).pdf",
    thermoplastic: "Order forms/Thermoplastic AFO Order Form (Fillable).pdf",
    bootline: "Order forms/Bootline Order Form (Fillable).pdf",
    crow: "Order forms/Crow Boot Order Form (Fillable).pdf",
    shoe: "Order forms/Shoe Modification Order Form (Fillable).pdf"
  };

  var FORMS_WITH_CAST = ["gauntlet", "thermoplastic", "bootline", "crow"];
  var currentFormType = null;

  // ----- FORM TYPE SELECTION -----

  formCards.forEach(function (card) {
    card.addEventListener("click", function () {
      var formType = this.dataset.form;

      formCards.forEach(function (c) {
        c.classList.remove("active");
        c.setAttribute("aria-pressed", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-pressed", "true");

      showForm(formType);
    });
  });

  function showForm(formType) {
    currentFormType = formType;
    formWrapper.style.display = "block";

    formSections.forEach(function (s) {
      s.hidden = true;
    });

    var section = document.getElementById("section-" + formType);
    if (section) section.hidden = false;

    var castSection = document.getElementById("section-cast");
    if (FORMS_WITH_CAST.indexOf(formType) !== -1) {
      castSection.hidden = false;
    } else {
      castSection.hidden = true;
    }

    formSubject.value = "New " + FORM_NAMES[formType];
    formTypeInput.value = FORM_NAMES[formType];

    selectedFormName.textContent = FORM_NAMES[formType];

    downloadBlankLink.href = FORM_BLANK_PDFS[formType];
    downloadBlankLink.style.display = "inline-flex";

    document.getElementById("orderFormSection").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ----- VALIDATION -----

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

  var requiredFields = orderForm ? orderForm.querySelectorAll("[required]") : [];
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
    field.addEventListener("change", function () {
      validateRequired(field);
    });
  });

  // ----- FORM SUBMISSION -----

  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!currentFormType) {
        alert("Please select an order form type first.");
        return;
      }

      var isValid = true;
      requiredFields.forEach(function (field) {
        var section = field.closest(".form-section");
        if (!section || !section.hidden) {
          if (!validateRequired(field)) {
            isValid = false;
          }
        }
      });

      if (!isValid) {
        var firstError = orderForm.querySelector(".error");
        if (firstError) firstError.focus();
        return;
      }

      var formData = new FormData(orderForm);

      var xhr = new XMLHttpRequest();
      xhr.open("POST", orderForm.action, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
          orderForm.style.display = "none";
          orderSuccess.hidden = false;
          orderSuccess.focus();
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

  // ----- DOWNLOAD PDF (Print) -----

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", function () {
      window.print();
    });
  }

})();
