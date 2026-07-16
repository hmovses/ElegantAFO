(function () {
  "use strict";

  var currentFormType = null;
  var currentStep = 1;

  var cardGrid = document.getElementById("formCardGrid");
  var formSection = document.getElementById("orderFormSection");
  var orderForm = document.getElementById("orderForm");
  var orderSuccess = document.getElementById("orderSuccess");
  var selectedFormTitle = document.getElementById("selectedFormTitle");
  var changeProductBtn = document.getElementById("changeProductBtn");
  var stepper = document.getElementById("stepper");
  var stepIndicators = stepper.querySelectorAll(".step-indicator");
  var stepPanels = [null,
    document.getElementById("step1"),
    document.getElementById("step2"),
    document.getElementById("step3")
  ];
  var nextBtn = document.getElementById("nextBtn");
  var prevBtn = document.getElementById("prevBtn");
  var downloadPdfBtn = document.getElementById("downloadPdfBtn");
  var downloadBlankLink = document.getElementById("downloadBlankLink");
  var productSections = document.querySelectorAll(".product-section");

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

  var REVIEW_FIELDS = {
    common: [
      { id: "physicianName", label: "Physician Name" },
      { id: "facility", label: "Facility" },
      { id: "physicianEmail", label: "Email" },
      { id: "physicianPhone", label: "Phone" },
      { id: "patientName", label: "Patient Name" },
      { id: "patientDob", label: "Date of Birth" },
      { id: "patientHeight", label: "Height" },
      { id: "patientWeight", label: "Weight" },
      { id: "shoeSize", label: "Shoe Size" },
      { id: "gender", label: "Gender" },
      { id: "laterality", label: "Laterality" },
      { id: "icd10", label: "ICD-10 Code" },
      { id: "diagnosis", label: "Diagnosis" }
    ],
    gauntlet: [
      { id: "gauntletHeight", label: "Overall Height" },
      { id: "gauntletLeatherColor", label: "Leather Color" },
      { id: "gauntletHeel", label: "Heel Style" },
      { id: "gauntletClosure", label: "Closure Type" },
      { id: "gauntletJoint", label: "Joint Selection" },
      { id: "gauntletPlasticThickness", label: "Plastic Thickness" },
      { checkbox: "gauntletExtraPadding", label: "Extra Padding" },
      { checkbox: "gauntletRemovableInsert", label: "Removable Insert" },
      { id: "gauntletFootplateTrim", label: "Foot Plate Trim" },
      { id: "gauntletFootplateCover", label: "Foot Plate Cover" }
    ],
    thermoplastic: [
      { id: "thermoProductType", label: "Product Type" },
      { id: "thermoColor", label: "Color" },
      { id: "thermoTrimLine", label: "Trim Line" },
      { id: "thermoHinge", label: "Hinge" },
      { id: "thermoPlasticType", label: "Plastic Type" },
      { id: "thermoPlasticThickness", label: "Plastic Thickness" },
      { checkbox: "thermoFoamLining", label: "Foam Lining" },
      { id: "thermoHeelCup", label: "Heel Cup" },
      { id: "thermoDurometer", label: "Durometer" },
      { id: "thermoPlantarStop", label: "Plantar Stop" },
      { id: "thermoFootplateTrim", label: "Foot Plate Trim" },
      { id: "thermoFootplateCover", label: "Foot Plate Cover" }
    ],
    bootline: [
      { id: "bootlineRocker", label: "Rocker Type" },
      { id: "bootlineMidCalfHeight", label: "Mid-Calf Height" },
      { id: "bootlineMidCalfCirc", label: "Mid-Calf Circumference" },
      { id: "bootlineForefoot", label: "Forefoot Measurement" }
    ],
    crow: [
      { id: "crowRocker", label: "Rocker Type" },
      { id: "crowPlasticColor", label: "Plastic Color" },
      { id: "crowPlasticType", label: "Plastic Type" },
      { id: "crowLiner", label: "Liner" }
    ],
    shoe: [
      { checkboxGroup: "shoeModType", label: "Modification Types" },
      { id: "shoeModOtherDesc", label: "Other Description" }
    ],
    cast: [
      { id: "castAnkle", label: "Ankle Angle" },
      { id: "castHindfoot", label: "Hindfoot Position" },
      { id: "castForefoot", label: "Forefoot Position" }
    ],
    shipping: [
      { id: "shipToName", label: "Ship To Name" },
      { id: "billToName", label: "Bill To Name" },
      { id: "shipToAddress", label: "Ship To Address" },
      { id: "poNumber", label: "PO Number" },
      { id: "priority", label: "Fabrication Priority" },
      { id: "shippingMethod", label: "Shipping Method" },
      { id: "formNotes", label: "Notes" }
    ]
  };

  // ----- CARD CLICK → TRANSITION TO FORM -----

  function startForm(formType) {
    cardGrid.classList.add("exiting");
    setTimeout(function () {
      cardGrid.style.display = "none";
      formSection.style.display = "block";
      showForm(formType);
      requestAnimationFrame(function () {
        formSection.classList.add("visible");
      });
    }, 300);

    formSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.querySelectorAll(".form-card-body").forEach(function (body) {
    body.addEventListener("click", function () {
      startForm(this.dataset.form);
    });
  });

  document.querySelectorAll(".form-card-btn-primary").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      startForm(this.dataset.form);
    });
  });

  function showForm(formType) {
    currentFormType = formType;
    selectedFormTitle.textContent = FORM_NAMES[formType];

    productSections.forEach(function (s) { s.hidden = true; });

    var section = document.getElementById("section-" + formType);
    if (section) section.hidden = false;

    var castSection = document.getElementById("section-cast");
    castSection.hidden = FORMS_WITH_CAST.indexOf(formType) === -1;

    document.getElementById("formSubject").value = "New " + FORM_NAMES[formType];
    document.getElementById("formTypeInput").value = FORM_NAMES[formType];

    downloadBlankLink.href = FORM_BLANK_PDFS[formType];
    downloadBlankLink.target = "_blank";
    downloadBlankLink.rel = "noopener noreferrer";
    downloadBlankLink.style.display = "inline-flex";

    goToStep(1);
  }

  // ----- STEP NAVIGATION -----

  function goToStep(step) {
    currentStep = step;

    for (var i = 1; i <= 3; i++) {
      stepPanels[i].classList.remove("active");
    }
    stepPanels[step].classList.add("active");

    stepIndicators.forEach(function (ind) {
      var s = parseInt(ind.dataset.step);
      ind.classList.remove("active", "completed");
      if (s < step) ind.classList.add("completed");
      else if (s === step) ind.classList.add("active");
    });

    prevBtn.style.display = step === 1 ? "none" : "inline-flex";

    if (step === 3) {
      nextBtn.style.display = "none";
      generateReview();
    } else {
      nextBtn.style.display = "inline-flex";
      nextBtn.innerHTML = "Next <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"9 18 15 12 9 6\"/></svg>";
    }

    var firstInput = stepPanels[step].querySelector("input:not([type=\"hidden\"]):not([type=\"checkbox\"]), select, textarea");
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 150);
  }

  nextBtn.addEventListener("click", function () {
    if (currentStep === 1 && !validateStep(1)) return;
    goToStep(currentStep + 1);
  });

  prevBtn.addEventListener("click", function () {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  // ----- VALIDATION -----

  function validateField(field) {
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

    field.addEventListener("blur", function () { validateField(field); });
    field.addEventListener("input", function () {
      var el = document.getElementById(field.id + "-error");
      if (el && el.textContent) validateField(field);
    });
    field.addEventListener("change", function () { validateField(field); });
  });

  function validateStep(step) {
    var fields = stepPanels[step].querySelectorAll("[required]");
    var valid = true;
    var firstInvalid = null;

    fields.forEach(function (f) {
      if (!validateField(f)) {
        valid = false;
        if (!firstInvalid) firstInvalid = f;
      }
    });

    if (firstInvalid) firstInvalid.focus();
    return valid;
  }

  // ----- REVIEW GENERATION -----

  function escHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function getFieldValue(fieldDef) {
    if (fieldDef.id) {
      var el = document.getElementById(fieldDef.id);
      if (!el) return "";
      var v = el.value ? el.value.trim() : "";
      if (el.tagName === "SELECT") {
        if (v && el.options[el.selectedIndex] && el.options[el.selectedIndex].text !== "Select...") {
          return el.options[el.selectedIndex].text;
        }
        return "";
      }
      return v;
    }
    if (fieldDef.checkbox) {
      var cb = document.querySelector("[name=\"" + fieldDef.checkbox + "\"]");
      return cb && cb.checked ? "Yes" : "";
    }
    if (fieldDef.checkboxGroup) {
      var checked = document.querySelectorAll("[name=\"" + fieldDef.checkboxGroup + "\"]:checked");
      if (checked.length > 0) {
        var vals = [];
        checked.forEach(function (c) { vals.push(c.value); });
        return vals.join(", ");
      }
      return "";
    }
    return "";
  }

  function buildReviewBlock(fields) {
    var items = [];
    fields.forEach(function (f) {
      var val = getFieldValue(f);
      if (val) items.push({ label: f.label, value: val });
    });
    if (items.length === 0) return null;

    var html = "<dl class=\"review-list\">";
    items.forEach(function (item) {
      html += "<div class=\"review-item\"><dt>" + escHtml(item.label) + "</dt><dd>" + escHtml(item.value) + "</dd></div>";
    });
    html += "</dl>";
    return html;
  }

  function generateReview() {
    var html = "";

    var commonBlock = buildReviewBlock(REVIEW_FIELDS.common);
    if (commonBlock) {
      html += "<div class=\"review-block\"><h4 class=\"review-block-title\">Prescriber &amp; Patient</h4>" + commonBlock + "</div>";
    }

    var prodFields = REVIEW_FIELDS[currentFormType];
    if (prodFields) {
      var prodBlock = buildReviewBlock(prodFields);
      if (prodBlock) {
        html += "<div class=\"review-block\"><h4 class=\"review-block-title\">" + escHtml(FORM_NAMES[currentFormType]) + " — Specs</h4>" + prodBlock + "</div>";
      }
    }

    if (FORMS_WITH_CAST.indexOf(currentFormType) !== -1) {
      var castBlock = buildReviewBlock(REVIEW_FIELDS.cast);
      if (castBlock) {
        html += "<div class=\"review-block\"><h4 class=\"review-block-title\">Cast Correction</h4>" + castBlock + "</div>";
      }
    }

    var shipBlock = buildReviewBlock(REVIEW_FIELDS.shipping);
    if (shipBlock) {
      html += "<div class=\"review-block\"><h4 class=\"review-block-title\">Shipping &amp; Notes</h4>" + shipBlock + "</div>";
    }

    if (!html) {
      html = "<p class=\"text-muted\" style=\"text-align:center;padding:var(--space-lg) 0\">No details provided yet.</p>";
    }

    document.getElementById("reviewContent").innerHTML = html;
  }

  // ----- CHANGE PRODUCT -----

  changeProductBtn.addEventListener("click", function () {
    formSection.classList.remove("visible");
    setTimeout(function () {
      formSection.style.display = "none";
      cardGrid.style.display = "grid";
      requestAnimationFrame(function () {
        cardGrid.classList.remove("exiting");
      });
    }, 300);
    orderForm.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ----- FORM SUBMISSION -----

  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!currentFormType) {
        alert("Please select an order form type first.");
        return;
      }

      var shipFields = stepPanels[3].querySelectorAll("[required]");
      var shipValid = true;
      var firstBad = null;
      shipFields.forEach(function (f) {
        if (!validateField(f)) {
          shipValid = false;
          if (!firstBad) firstBad = f;
        }
      });

      if (!shipValid) {
        goToStep(3);
        if (firstBad) setTimeout(function () { firstBad.focus(); }, 200);
        return;
      }

      var formData = new FormData(orderForm);
      var data = {};
      formData.forEach(function (value, key) { data[key] = value; });

      var xhr = new XMLHttpRequest();
      xhr.open("POST", orderForm.action, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201 || xhr.status === 202) {
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
      xhr.send(JSON.stringify(data));
    });
  }

})();
