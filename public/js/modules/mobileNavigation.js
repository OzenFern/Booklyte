/**
 * Mobile navigation toggle functionality
 * Handles the mobile navigation menu toggle, close on outside click, and close on link click
 */
export function initMobileNavigation() {
  const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
  const siteNav = document.querySelector(".site-nav");

  if (!mobileNavToggle || !siteNav) return;

  // Toggle mobile navigation
  mobileNavToggle.addEventListener("click", () => {
    const isExpanded = mobileNavToggle.getAttribute("aria-expanded") === "true";
    mobileNavToggle.setAttribute("aria-expanded", !isExpanded);
    siteNav.classList.toggle("is-open");
  });

  // Close mobile nav when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !mobileNavToggle.contains(event.target) &&
      !siteNav.contains(event.target)
    ) {
      mobileNavToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    }
  });

  // Close mobile nav when clicking a nav link
  siteNav.addEventListener("click", (event) => {
    if (event.target.classList.contains("site-nav__link")) {
      mobileNavToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    }
  });
}
