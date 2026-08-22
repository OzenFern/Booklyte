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
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  console.error(message, error);

  return {
    success: false,
    message,
    error: errorMessage,
  };
}

/**
 * Centralized controller error handling middleware for Express.
 *
 * @param {Error} err - The error object.
 * @param {string|null} message - User-facing message describing the failed operation.
 * @param {Object} req - The Express request object.
 * @param {Function} next - The next middleware function.
 */
export function handleControllerError(err, req, next, message = null) {
  console.error("Controller error:", err);

  // Set a generic error message for the user
  req.flash(
    "error",
    message ?? "An unexpected error occurred. Please try again later.",
  );

  // Pass the error to the next middleware (could be an error handler)
  next(err);
}
