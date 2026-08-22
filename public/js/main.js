document.addEventListener("click", (event) => {
  const dismissButton = event.target.closest("[data-flash-dismiss]");
  if (!dismissButton) return;

  const flash = dismissButton.closest(".flash");
  if (flash) {
    flash.remove();
  }
});

document.addEventListener(
  "error",
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (!target.hasAttribute("data-cover-fallback")) return;

    target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='480'%3E%3Crect width='320' height='480' fill='%23222925'/%3E%3Ctext x='50%25' y='50%25' fill='%23b8b7aa' font-family='serif' font-size='20' text-anchor='middle' dominant-baseline='middle'%3ENo Cover%3C/text%3E%3C/svg%3E";
    target.alt = "Cover image unavailable";
  },
  true,
);

document.body.addEventListener("htmx:afterRequest", (event) => {
  const sourceElement = event.detail.elt;
  const form = sourceElement?.closest?.(".js-redirect-on-success");
  if (!form || !event.detail.successful) return;

  const redirectPath = form.getAttribute("data-success-redirect");
  if (redirectPath) {
    window.location.assign(redirectPath);
  }
});
