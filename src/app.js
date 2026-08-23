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

// Middleware

/**
 * Configure session middleware for user authentication and flash messages
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
 * Middleware to make flash messages available in all views
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

/**
 * Parse URL-encoded request bodies
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Serve static files from the public directory
 */
app.use(express.static("public"));

// TODO: Add docstring for the following middleware

// TODO: Uncomment this middleware after completing the public folder setup
// Cache public folder
// app.use(
//     express.static(path.join(__dirname, "public"), {
//         maxAge: "30d",
//     }),
// );

/**
 * Log HTTP requests using Morgan middleware in development mode
 */
app.use(morgan("dev"));
// TODO: Add helmet middleware for security
// TODO: Add compression middleware for response compression
// TODO: Add cache middleware for caching static assets

// TODO: Delete the following comment after development
// app.get("/", (req, res) => {
//   res.redirect("/books");
//   //   res.render("errors/500");// Temporary placeholder for the home route
// });

/**
 * Register application routes
 */
app.use("/", pageRoutes);
app.use("/books", bookRoutes);
app.use("/library/books", reviewsRoutes);
app.use("/library", libraryRoutes);

/**
 * 404 Not Found handler - must be after all routes
 */
app.use(notFoundHandler);

/**
 * Global error handler - must be last in middleware chain
 */
app.use(errorHandler);

/**
 * Start the Express server on the configured port
 */
app.listen(env.appPort, () => {
  console.log(`Booklyte running on http://localhost:${env.appPort}`);
});
