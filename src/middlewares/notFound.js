/**
 * 404 Not Found error handler middleware for Booklyte.
 * Handles requests to undefined routes and renders a custom 404 error page.
 *
 * @module middlewares/notFound
 */

/**
 * Middleware to handle 404 Not Found errors.
 * Logs the invalid request and renders the 404 error page.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  console.warn(`[Booklyte 404] Cannot ${req.method} ${req.originalUrl}`);

  return res.status(404).render("errors/404");
};

export default notFoundHandler;
