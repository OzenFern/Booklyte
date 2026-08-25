/**
 * PostgreSQL connection pool used by Booklyte.
 *
 * @module db/pool
 */

import pg from "pg";
import env from "../config/env.js";

const { Pool } = pg;

/**
 * Application database connection pool.
 *
 * @type {Pool}
 */
const pool = new Pool(env.db);

export default pool;
