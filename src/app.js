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

const app = express();

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup EJS template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware

// Sets up sessions
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }),
);
// Sets up flash messages
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.warning = req.flash("warning");
  res.locals.info = req.flash("info");
  res.locals.currentPath = req.path;

  next();
});

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

// TODO: Uncomment this middleware after completing the public folder setup
// Cache public folder
// app.use(
//     express.static(path.join(__dirname, "public"), {
//         maxAge: "30d",
//     }),
// );

// Logging HTTP requests using morgan
app.use(morgan("dev"));
// TODO: Add helmet middleware for security
// TODO: Add compression middleware for response compression
// TODO: Add cache middleware for caching static assets

// TODO: Delete the following comment after development
// app.get("/", (req, res) => {
//   res.redirect("/books");
//   //   res.render("errors/500");// Temporary placeholder for the home route
// });

app.use("/", pageRoutes);
app.use("/books", bookRoutes);
app.use("/library/books", reviewsRoutes);
app.use("/library", libraryRoutes);

// 404 Not Found handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

app.listen(env.appPort, () => {
  console.log(`Booklyte running on http://localhost:${env.appPort}`);
});
