/**
 * This module provides service functions for managing reviews in the database.
 * It acts as an intermediary between the controllers and the review repository.
 * @module reviewService
 */
import * as rr from "../repositories/reviewRepository.js";
import { handleServiceError } from "../utils/errorHandler.js";
import { validateId } from "../utils/validationHandler.js";

/**
 * Validates review data against database constraints.
 * @param {Object} review - The review object to validate.
 * @param {boolean} isUpdate - Whether this is an update operation (library_book_id not required).
 * @returns {{valid: boolean, error: string|null}} Validation result.
 */
function validateReview(review, isUpdate = false) {
  // Validate rating is between 0 and 5
  if (review.rating != null) {
    if (
      typeof review.rating !== "number" ||
      review.rating < 0 ||
      review.rating > 5
    ) {
      return {
        valid: false,
        error: "Rating must be a number between 0 and 5.",
      };
    }
  }

  // Validate library_book_id is provided (only for create operations)
  if (!isUpdate && review.library_book_id == null) {
    return {
      valid: false,
      error: "Library book ID is required.",
    };
  }

  return { valid: true, error: null };
}

/**
 * Retrieves a review by its library book ID from the database.
 * @param {number} libraryBookId - The library book ID to retrieve the review for.
 * @returns {Promise<Object|null|{success: boolean, message: string, error: string}>} A promise that resolves to the review object if found, null if not found, or an error object.
 */
export async function getReviewByLibraryBookId(libraryBookId) {
  try {
    const idValidation = validateId(
      libraryBookId,
      new Error("Invalid library book ID."),
      "Library book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    return await rr.getReviewByLibraryBookId(libraryBookId);
  } catch (error) {
    return handleServiceError(
      error,
      `Failed to fetch review for library book with id ${libraryBookId}.`,
    );
  }
}

/**
 * Creates a new review in the database with constraint validation.
 * Incorporates error codes for foreign key violations, unique violations, and check constraint violations.
 * @param {Object} review - The review object to create.
 * @param {number} review.library_book_id - The library book ID the review is for.
 * @param {number} review.rating - The rating of the book (0-5).
 * @param {string} review.review_text - The text content of the review.
 * @returns {Promise<Object|{success: boolean, message: string, error: string}>} A promise that resolves to the created review object or an error object.
 */
export async function createReview(review) {
  try {
    // Validate review data
    const validation = validateReview(review);
    if (!validation.valid) {
      return handleServiceError(new Error(validation.error), validation.error);
    }

    // Check if a review already exists for this library book
    const existingReview = await rr.getReviewByLibraryBookId(
      review.library_book_id,
    );
    if (existingReview) {
      return handleServiceError(
        new Error("Review already exists for this library book."),
        "A review already exists for this library book. Use update instead.",
      );
    }

    return await rr.createReview(review);
  } catch (error) {
    // Handle database constraint violations
    if (error.code === "23503") {
      // Foreign key violation
      return handleServiceError(
        error,
        "Library book does not exist. Cannot create review for non-existent library book.",
      );
    }
    if (error.code === "23505") {
      // Unique violation
      return handleServiceError(
        error,
        "A review already exists for this library book.",
      );
    }
    if (error.code === "23514") {
      // Check constraint violation
      return handleServiceError(
        error,
        "Invalid rating value. Rating must be between 0 and 5.",
      );
    }

    return handleServiceError(error, "Failed to create review.");
  }
}

/**
 * Updates an existing review in the database with constraint validation.
 * Incorporates error codes for check constraint violations.
 * @param {number} id - The ID of the review to update.
 * @param {Object} review - The review object with updated properties.
 * @param {number} [review.rating] - The updated rating of the book (0-5).
 * @param {string} [review.review_text] - The updated text content of the review.
 * @returns {Promise<Object|null|{success: boolean, message: string, error: string}>} A promise that resolves to the updated review object if found, null if not found, or an error object.
 */
export async function updateReview(id, review) {
  try {
    // Validate review ID
    const idValidation = validateId(
      id,
      new Error("Invalid review ID."),
      "Review ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    // Validate review data if rating is being updated
    if (review.rating !== undefined) {
      const validation = validateReview({ rating: review.rating }, true);
      if (!validation.valid) {
        return handleServiceError(
          new Error(validation.error),
          validation.error,
        );
      }
    }

    // Check if review exists
    const existingReview = await rr.getReviewById(id);
    if (!existingReview) {
      return handleServiceError(
        new Error("Review not found."),
        `Review with id ${id} does not exist.`,
      );
    }

    return await rr.updateReview(id, review);
  } catch (error) {
    // Handle database constraint violations
    if (error.code === "23514") {
      // Check constraint violation
      return handleServiceError(
        error,
        "Invalid rating value. Rating must be between 0 and 5.",
      );
    }

    return handleServiceError(error, `Failed to update review with id ${id}.`);
  }
}

/**
 * Deletes a review from the database.
 * @param {number} id - The ID of the review to delete.
 * @returns {Promise<Object|null|{success: boolean, message: string, error: string}>} A promise that resolves to the deleted review object if found, null if not found, or an error object.
 */
export async function deleteReview(id) {
  try {
    const idValidate = validateId(
      id,
      new Error("Invalid review ID."),
      "Review ID must be a valid number.",
    );
    if (!idValidate.success) {
      return idValidate;
    }

    // Check if review exists
    const existingReview = await rr.getReviewById(id);
    if (!existingReview) {
      return handleServiceError(
        new Error("Review not found."),
        `Review with id ${id} does not exist.`,
      );
    }

    return await rr.deleteReview(id);
  } catch (error) {
    return handleServiceError(error, `Failed to delete review with id ${id}.`);
  }
}
