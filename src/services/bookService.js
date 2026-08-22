/**
 * This module provides service functions for managing books in the database.
 * It acts as an intermediary between the controllers and the book repository.
 * @module bookService
 */
import * as bk from "../repositories/bookRepository.js";
import pool from "../db/pool.js";
import { handleServiceError } from "../utils/errorHandler.js";
import {
  associateAuthorWithBook,
  createAuthor,
  findByOpenLibraryId,
} from "../repositories/authorRepository.js";
import * as openLibrary from "../integrations/openLibrary/openLibraryService.js";
import {
  validateId,
  strictJsonParse,
  executeTransaction,
} from "../utils/validationHandler.js";

/**
 * Retrieves all books from the database.
 * @returns {Promise<Array | Object>} A promise that resolves to an array of book objects with authors or an error object if not found.
 */
export async function getAllBooks() {
  try {
    const books = await bk.getAllBooks();
    return books.map((book) => ({
      ...book,
      authors: strictJsonParse(book.authors),
    }));
  } catch (error) {
    return handleServiceError(error, "Failed to fetch books.");
  }
}

/**
 * Retrieves a book by its ID from the database.
 * @param {number} id - The ID of the book to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the book object with authors if found, or null if not found.
 */
export async function getBookById(id) {
  try {
    const idValidation = validateId(
      id,
      new Error("Invalid book ID."),
      "Book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }
    const book = await bk.getBookById(id);
    if (book) {
      return {
        ...book,
        authors: strictJsonParse(book.authors),
      };
    }
    return null;
  } catch (error) {
    return handleServiceError(error, `Failed to fetch book with id ${id}.`);
  }
}

/**
 * Creates a new book, adds and associates authors in the database.
 * @param {Object} book - The book object to create.
 * @returns {Promise<Object>} A promise that resolves to the created book object with authors.
 */
export async function createBook(book) {
  const client = await pool.connect();
  try {
    const result = await executeTransaction(client, async () => {
      const createdBook = await bk.createBook(book);

      if (book.authors && Array.isArray(book.authors)) {
        for (const author of book.authors) {
          let existingAuthor = await findByOpenLibraryId(author.openlibrary_id);
          if (!existingAuthor) {
            existingAuthor = await createAuthor(author);
          }
          await associateAuthorWithBook(
            existingAuthor.author_id,
            createdBook.book_id,
          );
        }
      }

      return createdBook;
    });

    return await bk.getBookById(result.book_id);
  } catch (error) {
    return handleServiceError(error, "Failed to create book.");
  } finally {
    client.release();
  }
}

/**
 * Search external books via Open Library.
 * @param {string} query - The search query string.
 * @param {number} [limit=20] - Maximum number of results to return.
 * @returns {Promise<Array<Object> | Object>} A promise that resolves to an array of normalized book objects or an error object if the search fails.
 */
export async function searchExternalBooks(query, limit = 20) {
  try {
    return await openLibrary.searchExternalBooks(query, limit);
  } catch (error) {
    return handleServiceError(error, "Failed to search external books.");
  }
}

/**
 * Import a book from Open Library by its work id
 * @param {string} openLibraryId - The Open Library work ID.
 * @returns {Promise<Object>} A promise that resolves to the imported book object with authors.
 */
export async function importBookFromOpenLibrary(openLibraryId) {
  const client = await pool.connect();
  try {
    const existing = await bk.getBookById(openLibraryId, true);
    if (existing) return existing;

    const result = await executeTransaction(client, async () => {
      const work = await openLibrary.getWorkDetails(openLibraryId);

      const bookPayload = {
        openlibrary_id: work.openlibrary_id,
        title: work.title,
        description: work.description,
        cover_url: work.cover_url,
        published_date: work.published_date,
      };

      const insertBookQuery =
        "INSERT INTO books (openlibrary_id, title,description,cover_url, published_date) VALUES ($1, $2, $3, $4, $5) RETURNING *";
      const { rows: bookRows } = await client.query(insertBookQuery, [
        bookPayload.openlibrary_id,
        bookPayload.title,
        bookPayload.description,
        bookPayload.cover_url,
        bookPayload.published_date,
      ]);
      const createdBook = bookRows[0];

      if (work.authors && Array.isArray(work.authors)) {
        for (const author of work.authors) {
          let existingAuthor = await findByOpenLibraryId(author.openlibrary_id);
          if (!existingAuthor) {
            const insertAuthorQuery =
              "INSERT INTO authors (openlibrary_id, name) VALUES ($1, $2) RETURNING *";
            const { rows: authorRows } = await client.query(insertAuthorQuery, [
              author.openlibrary_id,
              author.name,
            ]);
            existingAuthor = authorRows[0];
          }
          const insertBAQuery =
            "INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)";
          await client.query(insertBAQuery, [
            createdBook.book_id,
            existingAuthor.author_id,
          ]);
        }
      }

      return createdBook;
    });

    return await bk.getBookById(result.book_id);
  } catch (error) {
    return handleServiceError(
      error,
      "Failed to import book from Open Library.",
    );
  } finally {
    client.release();
  }
}

/**
 * Completely updates an existing book in the database.
 * @param {number} id - The ID of the book to update.
 * @param {Object} book - The book object with updated properties.
 * @returns {Promise<Object|null>} A promise that resolves to the updated book object with authors if found, or null if not found.
 */
export async function putBook(id, book) {
  try {
    const idValidation = validateId(
      id,
      new Error("Invalid book ID."),
      "Book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    const updatedBook = await bk.putBook(id, book);
    if (updatedBook) {
      // Fetch the updated book with authors using the updated repository function
      return await bk.getBookById(updatedBook.book_id);
    }
    return null;
  } catch (error) {
    return handleServiceError(error, `Failed to update book with id ${id}.`);
  }
}

/**
 * Partially updates an existing book in the database.
 * @param {number} id - The ID of the book to update.
 * @param {Object} book - The book object with updated properties.
 * @returns {Promise<Object|null>} A promise that resolves to the updated book object with authors if found, or null if not found.
 */
export async function patchBook(id, book) {
  try {
    const idValidation = validateId(
      id,
      new Error("Invalid book ID."),
      "Book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    const updatedBook = await bk.patchBook(id, book);
    if (updatedBook) {
      // Fetch the updated book with authors using the updated repository function
      return await bk.getBookById(updatedBook.book_id);
    }
    return null;
  } catch (error) {
    return handleServiceError(error, `Failed to patch book with id ${id}.`);
  }
}

/**
 * Deletes a book from the database.
 * @param {number} id - The ID of the book to delete.
 * @returns {Promise<Object|null>} A promise that resolves to the deleted book object if found, or null if not found.
 */
export async function deleteBook(id) {
  try {
    const idValidation = validateId(
      id,
      new Error("Invalid book ID."),
      "Book ID must be a valid number.",
    );
    if (!idValidation.success) {
      return idValidation;
    }

    return await bk.deleteBook(id);
  } catch (error) {
    return handleServiceError(error, `Failed to delete book with id ${id}.`);
  }
}
