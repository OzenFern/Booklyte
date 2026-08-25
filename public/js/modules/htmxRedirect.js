/**
 * HTMX redirect functionality
 * Handles redirect after successful HTMX requests for forms with redirect-on-success class
 */
export function initHtmxRedirect() {
  document.body.addEventListener("htmx:afterRequest", (event) => {
    const sourceElement = event.detail.elt;
    const form = sourceElement?.closest?.(".js-redirect-on-success");
    if (!form || !event.detail.successful) return;

    const redirectPath = form.getAttribute("data-success-redirect");
    if (redirectPath) {
      window.location.assign(redirectPath);
    }
  });
}
