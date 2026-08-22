/**
 * This module provides service functions for managing library books in the database.
 * It acts as an intermediary between the controllers and the library repository.
 * @module libraryService
 */
import * as lr from "../repositories/libraryRepository.js";
import { handleServiceError } from "../utils/errorHandler.js";
import { validateId } from "../utils/validationHandler.js";

/**
 * Retrieves all library books from the database.
 * @returns {Promise<Array | Object>} A promise that resolves to an array of library book objects or an error object if not found.
 */
export async function getAllLibraryBooks() {
  try {
    return await lr.getLibraryBooks();
  } catch (error) {
    return handleServiceError(error, "Failed to fetch library books.");
  }
}

/**
 * Retrieves a library book by its ID from the database.
 * @param {number} id - The ID of the library book to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the library book object if found, or null if not found.
 */
export async function getLibraryBookById(id) {
  try {
    const idValidation = validateId(
      id,
      new Error("Invalid library book ID."),
      "Library book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    return await lr.getLibraryBookById(id);
  } catch (error) {
    return handleServiceError(
      error,
      `Failed to fetch library book with id ${id}.`,
    );
  }
}

/**
 * Adds a book to the library in the database.
 * @param {number} bookId - The ID of the book to add to the library.
 * @param {string} status - The status of the library book (e.g. 'want_to_read', 'reading', 'completed', 'dropped').
 * @returns {Promise<Object>} A promise that resolves to the added library book object.
 */
export async function addBookToLibrary(bookId, status) {
  try {
    const idValidation = validateId(
      bookId,
      new Error("Invalid book ID."),
      "Book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    return await lr.addBookToLibrary(bookId, status);
  } catch (error) {
    return handleServiceError(error, "Failed to add book to library.");
  }
}

/**
 * Updates a library book completely or partially in the database.
 * @param {number} id - The ID of the library book to update.
 * @param {Object} updates - An object containing the properties to update.
 * @param allowPartial - A boolean indicating whether to allow partial updates (default: true).
 * @returns {Promise<Object|null>} A promise that resolves to the updated library book object if found, or null if not found.
 */
export async function updateLibraryBook(id, updates, allowPartial = true) {
  try {
    const idValidation = validateId(
      id,
      new Error("Invalid library book ID."),
      "Library book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    return await (allowPartial ? lr.patchLibraryBook(id, updates) : lr.putLibraryBook(id, updates));
  } catch (error) {
    return handleServiceError(
      error,
      `Failed to update library book with id ${id}.`,
    );
  }
}

/**
 * Removes a book from the library in the database.
 * @param {number} id - The ID of the library book to remove.
 * @returns {Promise<void | {success: boolean, message: string, error: string}>} A promise that resolves when the book is removed from the library.
 */
export async function removeBookFromLibrary(id) {
  try {
    const idValidation = validateId(
      id,
      new Error("Invalid library book ID."),
      "Library book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    return await lr.removeBookFromLibrary(id);
  } catch (error) {
    return handleServiceError(
      error,
      `Failed to remove library book with id ${id}.`,
    );
  }
}
