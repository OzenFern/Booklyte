/**
 * Handles service errors in a centralized manner.
 * @module errorHandler
 */

/**
 * Centralized service error handling.
 *
 * @param {Error|unknown} error - The thrown error.
 * @param {string} message - User-facing message describing the failed operation.
 * @returns {{ success: boolean, message: string, error: string }}
 */
export function handleServiceError(error, message) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(message, error);

    return {
        success: false,
        message,
        error: errorMessage,
    };
}
