/**
 * This file contains the environment configuration for the application. It exports an object with various settings that can be used throughout the application. The settings include database connection details, API keys, and other environment-specific variables.
 * @module env
 */
import "dotenv/config.js";

const env = {
  appPort: process.env.APP_PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || "default secret",
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "booklyte",
    port: process.env.DB_PORT || 5432,
  },
};

export default env;
