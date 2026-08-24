/** Makes failed HTMX requests visible in the shared flash-message region. */
export function initHtmxFeedback() {
  document.body.addEventListener('htmx:responseError', (event) => {
    const stack = document.getElementById('flash-stack');
    if (!stack) return;

    const response = event.detail.xhr?.responseText || '';
    const responseDocument = new DOMParser().parseFromString(response, 'text/html');
    const message = responseDocument.querySelector('.flash__message')?.textContent?.trim()
      || 'We could not complete that request. Please try again.';

    const flash = document.createElement('article');
    flash.className = 'flash flash-error';
    flash.setAttribute('role', 'alert');
    flash.innerHTML = '<p class="flash__message"></p><button type="button" class="flash__dismiss" data-flash-dismiss aria-label="Dismiss message">Dismiss</button>';
    flash.querySelector('.flash__message').textContent = message;
    stack.prepend(flash);
  });
}
