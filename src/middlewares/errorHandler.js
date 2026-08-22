/**
 * Global error handler middleware for Booklyte.
 * Handles server errors and renders appropriate error responses.
 *
 * @module middlewares/errorHandler
 */

/**
 * Middleware to handle global errors.
 * Logs the error and renders an HTML error page.
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Booklyte Error] ${err.message}`);
  console.error(err.stack);

  // If headers are already sent, delegate to Express's default error handler
  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).render("errors/500", {
    error: process.env.NODE_ENV === "development" ? err.message : "Internal Server Error"
  });
};

export default errorHandler;
