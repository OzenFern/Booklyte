/**
 * Flash message dismissal functionality
 * Handles the dismissal of flash messages when the dismiss button is clicked
 */
export function initFlashMessages() {
  document.addEventListener("click", (event) => {
    const dismissButton = event.target.closest("[data-flash-dismiss]");
    if (!dismissButton) return;

    const flash = dismissButton.closest(".flash");
    if (flash) {
      flash.remove();
    }
  });
}
