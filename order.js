(function () {
  "use strict";

  var uploadForm = document.getElementById("uploadForm");
  var uploadSuccess = document.getElementById("uploadSuccess");
  var fileInput = document.getElementById("pdfFile");
  var fileLabel = document.getElementById("fileLabel");

  // Show selected filename
  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", function () {
      if (fileInput.files && fileInput.files.length > 0) {
        fileLabel.textContent = fileInput.files[0].name;
      } else {
        fileLabel.textContent = "Choose PDF file...";
      }
    });
  }

  function validateRequired(field) {
    var errorEl = document.getElementById(field.id + "-error");
    if (!errorEl) return true;

    if (field.type === "file") {
      if (!field.files || field.files.length === 0) {
        errorEl.textContent = "Please upload your completed PDF form.";
        field.classList.add("error");
        field.classList.remove("success");
        return false;
      }
      if (field.files[0].type !== "application/pdf" && !field.files[0].name.toLowerCase().endsWith(".pdf")) {
        errorEl.textContent = "Please upload a PDF file.";
        field.classList.add("error");
        field.classList.remove("success");
        return false;
      }
    } else {
      if (!field.value || field.value.trim() === "") {
        errorEl.textContent = "This field is required.";
        field.classList.add("error");
        field.classList.remove("success");
        return false;
      }
    }

    errorEl.textContent = "";
    field.classList.remove("error");
    field.classList.add("success");
    return true;
  }

  // Create error spans for required fields
  var requiredFields = uploadForm ? uploadForm.querySelectorAll("[required]") : [];
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

  if (uploadForm) {
    uploadForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var isValid = true;
      requiredFields.forEach(function (field) {
        if (!validateRequired(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        var firstError = uploadForm.querySelector(".error");
        if (firstError) firstError.focus();
        return;
      }

      var formData = new FormData(uploadForm);
      var xhr = new XMLHttpRequest();
      xhr.open("POST", uploadForm.action, true);
      xhr.setRequestHeader("Accept", "application/json");
      xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 201) {
          uploadForm.style.display = "none";
          if (uploadSuccess) {
            uploadSuccess.hidden = false;
            uploadSuccess.focus();
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

})();
