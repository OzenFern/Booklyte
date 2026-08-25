/**
 * Main JavaScript entry point
 * Initializes all JavaScript modules for the Booklyte application
 */

import { initFlashMessages } from "./modules/flash.js";
import { initImageFallback } from "./modules/imageFallback.js";
import { initHtmxRedirect } from "./modules/htmxRedirect.js";
import { initHtmxFeedback } from "./modules/htmxFeedback.js";
import { initMobileNavigation } from "./modules/mobileNavigation.js";
import { initFormValidation } from "./modules/formValidation.js";
import { initThemeToggle } from "./modules/themeToggle.js";
import { initLibrarySearch } from "./modules/librarySearch.js";
import "./modules/dateFormatter.js";

// Initialize all modules when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initFlashMessages();
  initImageFallback();
  initHtmxRedirect();
  initHtmxFeedback();
  initMobileNavigation();
  initFormValidation();
  initThemeToggle();
  initLibrarySearch();
});
