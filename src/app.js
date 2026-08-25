/**
 * Main application entry point for Booklyte
 * Configures Express server with middleware, routes, and error handling
 * @module app
 */
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import env from "./config/env.js";
import session from "express-session";
import flash from "connect-flash";
import {
  pageRoutes,
  bookRoutes,
  reviewsRoutes,
  libraryRoutes,
} from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/index.js";
import helmet from "helmet";
import compression from "compression";
import "./db/pool.js";

/**
 * Express application instance
 * @type {Object}
 */
const app = express();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure EJS template engine for server-side rendering
 */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Security & Core Middleware (Order matters for security)

/**
 * Helmet middleware for security headers
 * Must be applied early to protect all subsequent middleware
 * Configured to be HTMX-compatible by disabling Content Security Policy
 * which often conflicts with HTMX's inline JavaScript
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

/**
 * Compress response bodies for all requests to improve performance
 * Configured with optimal settings for web applications
 */
app.use(
  compression({
    filter: (req, res) => {
      // Don't compress if client doesn't accept encoding
      if (req.headers["x-no-compression"]) {
        return false;
      }
      // Compress all responses that should be compressed
      return compression.filter(req, res);
    },
    threshold: 1024, // Only compress responses larger than 1KB
    level: 6, // Compression level (1-9, 6 is default balance)
  }),
);

/**
 * Log HTTP requests using Morgan middleware
 */
app.use(morgan("dev"));

/**
 * Parse URL-encoded request bodies
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Parse JSON request bodies
 */
app.use(express.json());

/**
 * Serve static files from the public directory with caching
 * Static assets are cached for 30 days to improve performance
 */
app.use(
  express.static(path.join(__dirname, "../public"), {
    maxAge: "30d",
  }),
);

// Session Middleware

/**
 * Configure session middleware for flash messages
 */
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }),
);

/**
 * Configure flash messages for temporary notifications
 */
app.use(flash());

/**
 * Middleware to make flash messages and current path available in all views
 * Sets up success, error, warning, and info message types
 */
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.warning = req.flash("warning");
  res.locals.info = req.flash("info");
  res.locals.currentPath = req.path;

  next();
});

// Application Routes

/**
 * Register application routes
 */
app.use("/", pageRoutes);
app.use("/books", bookRoutes);
app.use("/library/books", reviewsRoutes);
app.use("/library", libraryRoutes);

// Error Handling Middleware (Must be last)

/**
 * 404 Not Found handler - must be after all routes
 */
app.use(notFoundHandler);

/**
 * Global error handler - must be last in middleware chain
 */
app.use(errorHandler);

/**
 * Export the Express application instance
 * This allows for testing and flexible server initialization
 */
export default app;
