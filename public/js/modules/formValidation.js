/**
 * Form validation module
 * Provides client-side form validation for HTMX forms
 */

export function initFormValidation() {
  // Listen for HTMX validation events
  document.body.addEventListener("htmx:validation:failed", function (evt) {
    const form = evt.target;
    if (form.tagName === "FORM") {
      highlightInvalidFields(form);
    }
  });

  // Add validation to all forms with hx-validate
  document.querySelectorAll("form[hx-validate]").forEach((form) => {
    addValidationListeners(form);
  });
}

function addValidationListeners(form) {
  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    input.addEventListener("blur", () => {
      validateField(input);
    });

    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        validateField(input);
      }
    });
  });
}

function validateField(input) {
  const isValid = input.checkValidity();

  if (!isValid) {
    input.classList.add("invalid");
    showFieldError(input, input.validationMessage);
  } else {
    input.classList.remove("invalid");
    hideFieldError(input);
  }

  return isValid;
}

function highlightInvalidFields(form) {
  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    if (!input.checkValidity()) {
      input.classList.add("invalid");
      showFieldError(input, input.validationMessage);
    }
  });
}

function showFieldError(input, message) {
  let errorElement = input.nextElementSibling;

  if (!errorElement || !errorElement.classList.contains("field-error")) {
    errorElement = document.createElement("div");
    errorElement.className = "field-error";
    errorElement.style.color = "var(--color-danger)";
    errorElement.style.fontSize = "0.875rem";
    errorElement.style.marginTop = "0.25rem";
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }

  errorElement.textContent = message;
}

function hideFieldError(input) {
  const errorElement = input.nextElementSibling;

  if (errorElement && errorElement.classList.contains("field-error")) {
    errorElement.remove();
  }
}
