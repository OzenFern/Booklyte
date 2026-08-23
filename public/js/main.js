/**
 * Main JavaScript entry point
 * Initializes all JavaScript modules for the Booklyte application
 */

import { initFlashMessages } from './modules/flash.js';
import { initImageFallback } from './modules/imageFallback.js';
import { initHtmxRedirect } from './modules/htmxRedirect.js';
import { initMobileNavigation } from './modules/mobileNavigation.js';
// import { initFormValidation } from './modules/formValidation.js';
// import { initSearch } from './modules/search.js';
import './modules/dateFormatter.js';

// Initialize all modules when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFlashMessages();
  initImageFallback();
  initHtmxRedirect();
  initMobileNavigation();
});
