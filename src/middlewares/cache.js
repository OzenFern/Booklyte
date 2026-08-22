/**
 * Static asset caching middleware for Booklyte.
 * Provides caching configuration for static assets to improve performance.
 *
 * @module middlewares/cache
 */

/**
 * Middleware to configure static asset caching.
 * Sets appropriate cache headers for static assets.
 *
 * @param {string} maxAge - Cache duration (e.g., "30d", "1h")
 * @returns {Function} Express middleware function
 */
const cacheMiddleware = (maxAge = "30d") => {
  return (req, res, next) => {
    // Cache static assets
    res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    next();
  };
};

export default cacheMiddleware;
