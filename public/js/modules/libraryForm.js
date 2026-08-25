/**
 * Library form handling module
 * Handles form submissions for adding books to library with error handling
 */

export function initLibraryForms() {
  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('.book-card__library-form');
    if (!form) return;

    event.preventDefault();

    const button = form.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    const formData = new FormData(form);

    // Show loading state
    button.disabled = true;
    button.textContent = 'Adding...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'text/html',
        },
      });

      if (response.ok) {
        // Success - redirect will be handled by server
        window.location.href = response.url;
      } else {
        // Error - display error message
        const errorText = response.statusText || 'Failed to add book to library';
        showFlashMessage('error', errorText);
        button.disabled = false;
        button.textContent = originalText;
      }
    } catch (error) {
      // Network error or other failure
      showFlashMessage('error', 'Network error. Please try again.');
      button.disabled = false;
      button.textContent = originalText;
    }
  });
}

/**
 * Shows a flash message with the given type and content
 * @param {string} type - The type of flash message (success, error, warning, info)
 * @param {string} message - The message content
 */
function showFlashMessage(type, message) {
  const flashStack = document.querySelector('.flash-stack');
  if (!flashStack) {
    // Create flash stack if it doesn't exist
    const newFlashStack = document.createElement('section');
    newFlashStack.className = 'flash-stack';
    newFlashStack.setAttribute('aria-live', 'polite');
    document.body.prepend(newFlashStack);
  }

  const typeClassMap = {
    success: 'flash-success',
    error: 'flash-error',
    warning: 'flash-warning',
    info: 'flash-info',
  };

  const flash = document.createElement('article');
  flash.className = `flash ${typeClassMap[type] || 'flash-info'}`;
  flash.setAttribute('role', 'status');

  flash.innerHTML = `
    <p class="flash__message">${message}</p>
    <button
      type="button"
      class="flash__dismiss"
      data-flash-dismiss
      aria-label="Dismiss message"
    >
      Dismiss
    </button>
  `;

  const stack = document.querySelector('.flash-stack');
  stack.appendChild(flash);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    flash.remove();
  }, 5000);
}