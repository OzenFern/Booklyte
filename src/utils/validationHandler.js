/**
 * This file contains utility functions that can be used throughout the application.
 * @module validationHandler
 */
import { handleServiceError } from "./errorHandler.js";

/**
 * Helper for destructuring object into key-value pairs and validating required fields.
/**
 * Destructures an object into its keys and values, and validates that all required fields are present.
 * @param obj - The object to destructure and validate.
 * @param {boolean} [allowPartial=false] - Whether to allow partial updates (missing fields are okay).
 * @returns {{fields: string[], values: unknown[]}}
 */
export function destructureAndValidate(obj, allowPartial = false) {
  const fields = Object.keys(obj);
  const values = Object.values(obj);

  // Check for missing required fields (only if not allowing partial updates)
  if (!allowPartial) {
    const missingFields = fields.filter((field) => obj[field] == null);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }

  // Filter out undefined/null values for partial updates
  if (allowPartial) {
    const validFields = [];
    const validValues = [];
    fields.forEach((field, index) => {
      if (obj[field] != null) {
        validFields.push(field);
        validValues.push(values[index]);
      }
    });
    return { fields: validFields, values: validValues };
  }

  return { fields, values };
}

/**
 * Validates that the provided ID is a number and not null or undefined.
 * @param {number|string} id - The ID to validate (can be string from route params).
 * @param {Error|unknown} errorObject - The error object to pass to the error handler if validation fails.
 * @param {string} errorMessage - The error message to pass to the error handler if validation fails.
 * @returns {{success: boolean, message: string, error: string|null}}
 */
export function validateId(id, errorObject, errorMessage) {
  const numericId = parseInt(id, 10); // Parse the ID as an integer
  if (!id || isNaN(numericId)) {
    return handleServiceError(errorObject, errorMessage);
  }
  return { success: true, message: "ID is valid", error: null };
}

/**
 * Extracts and normalizes an ID from a key or URL path.
 * Uses regex to extract the last segment before any trailing slash.
 *
 * @param {string|number|null|undefined} keyOrId - The key or ID to normalize.
 * @returns {string|null} The normalized ID, or null if invalid.
 *
 * @example
 * normalizeId("/works/OL123W") // Returns "OL123W"
 * normalizeId("OL123W") // Returns "OL123W"
 * normalizeId("/authors/OL456A/") // Returns "OL456A"
 * normalizeId(null) // Returns null
 */
export function normalizeId(keyOrId) {
  if (!keyOrId) return null;

  const match = String(keyOrId).match(/([^/]+)\/?$/);
  return match ? match[1].trim() : null;
}

/**
 * Safely extracts a value from an object that may be a string or nested object.
 * Commonly used for API responses where descriptions can be either format.
 *
 * @param {string|Object|null|undefined} value - The value to extract.
 * @returns {string|null} The extracted string value, or null if invalid.
 *
 * @example
 * extractStringValue("plain text") // Returns "plain text"
 * extractStringValue({ value: "nested text" }) // Returns "nested text"
 * extractStringValue(null) // Returns null
 */
export function extractStringValue(value) {
  if (typeof value === "string") return value;
  if (value?.value) return value.value;
  return null;
}

/**
 * Strictly parses a JSON string.
 *
 * @param {any} value - The value to parse.
 * @param {any} fallback - What to return if parsing fails.
 * @returns {Object|Array|null} The parsed JSON, or the fallback if invalid.
 * @throws {Error} If parsing fails and no fallback is provided.
 *
 * @example
 * strictJsonParse('{"key": "value"}') // Returns { key: "value" }
 * strictJsonParse('invalid json', {}) // Returns {}
 * strictJsonParse('invalid json') // Throws Error
 */
export function strictJsonParse(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value; // Already parsed

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      // Returns a predictable default instead of a rogue string
      if (fallback !== undefined) return fallback;
      throw new Error("Invalid JSON format.");
    }
  }

  if (fallback !== undefined) return fallback;
  throw new Error("Invalid JSON format.");
}

/**
 * Executes a database operation within a transaction with automatic rollback on error.
 *
 * @param {Object} client - The database client.
 * @param {Function} operation - The async operation to execute within the transaction.
 * @returns {Promise<T>} The result of the operation.
 * @throws {Error} If the operation fails, transaction is rolled back.
 * @template T
 *
 * @example
 * const result = await executeTransaction(client, async () => {
 *   await client.query("INSERT INTO books ...");
 *   return await client.query("SELECT * FROM books");
 * });
 */
export async function executeTransaction(client, operation) {
  try {
    await client.query("BEGIN");
    const result = await operation();
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
