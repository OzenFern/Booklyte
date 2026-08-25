/**
 * Theme toggle module
 * Handles switching between light and dark modes
 */

export function initThemeToggle() {
  const themeToggle = document.getElementById("theme-toggle");

  if (!themeToggle) return;

  const savedTheme =
    localStorage.getItem("booklyte-theme") ||
    (window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark");
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.setAttribute("aria-pressed", String(savedTheme === "dark"));
  themeToggle.querySelector(".theme-toggle__icon").textContent =
    savedTheme === "dark" ? "☾" : "☀";

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("booklyte-theme", newTheme);
    themeToggle.setAttribute("aria-pressed", String(newTheme === "dark"));
    themeToggle.querySelector(".theme-toggle__icon").textContent =
      newTheme === "dark" ? "☾" : "☀";
  });
}
