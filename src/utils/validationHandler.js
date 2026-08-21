/**
 * This file contains utility functions that can be used throughout the application.
 * @module validationHandler
 */
import {handleServiceError} from "./errorHandler.js";

// Helper for destructuring object into key-value pairs and validating required fields
/**
 * Destructures an object into its keys and values, and validates that all required fields are present.
 * @param obj - The object to destructure and validate.
 * @returns {{fields: string[], values: unknown[]}}
 */
export function destructureAndValidate(obj) {
    const fields = Object.keys(obj);
    const values = Object.values(obj);

    // Check for missing required fields
    const missingFields = fields.filter((field) => obj[field] === undefined || obj[field] === null);
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return { fields, values };
}

/**
 * Validates that the provided ID is a number and not null or undefined.
 * @param id - The ID to validate.
 * @param errorObject - The error object to pass to the error handler if validation fails.
 * @param errorMessage - The error message to pass to the error handler if validation fails.
 * @returns {{success: boolean, message: string, error: string|null}}
 */
export function validateId(id, errorObject, errorMessage) {
    if (!id || typeof id !== 'number') {
        return handleServiceError(errorObject, errorMessage);
    }
    return { success: true, message: "ID is valid", error: null };
}