/**
 * Server entry point for Booklyte
 * Initializes and starts the Express server
 * @module server
 */
import app from "./app.js";
import env from "./config/env.js";

/**
 * Start the Express server on the configured port
 */
app.listen(env.appPort, () => {
  console.log(`Booklyte running on http://localhost:${env.appPort}`);
});
