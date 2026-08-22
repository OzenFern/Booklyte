/**
 * Handles library actions for a book for performing CRUD operations on the library table in the database.
 * @module libraryRepository
 */

import pool from "../db/pool.js";
import { destructureAndValidate } from "../utils/validationHandler.js";

/**
 * Retrieves all library books from the database.
 * Uses a SQL query to join the library_books, books, book_authors, and authors tables to get the necessary information.
 * @returns {Promise<Array>} A promise that resolves to an array of library book objects.
 */
export async function getLibraryBooks() {
  const query = `SELECT
                       lb.library_book_id,
                       lb.status,
                       b.book_id,
                       b.title,

                       COALESCE(
                                       JSON_AGG(
                                       JSON_BUILD_OBJECT(
                                               'author_id', a.author_id,
                                               'name', a.name
                                       )
                                               ) FILTER (WHERE a.author_id IS NOT NULL),
                                       '[]'
                       ) AS authors

                   FROM library_books lb

                            JOIN books b
                                 ON lb.book_id = b.book_id

                            LEFT JOIN book_authors ba
                                      ON b.book_id = ba.book_id

                            LEFT JOIN authors a
                                      ON ba.author_id = a.author_id

                   GROUP BY
                       lb.library_book_id,
                       lb.status,
                       b.book_id,
                       b.title`;

  const { rows } = await pool.query(query);
  return rows;
}

/**
 * Retrieves a library book by its ID from the database.
 * @param {number} id - The ID of the library book to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the library book object if found, or null if not found.
 */
export async function getLibraryBookById(id) {
  const query = `SELECT
                       lb.library_book_id,
                       lb.status,
                       b.book_id,
                       b.title,

                       COALESCE(
                                       JSON_AGG(
                                       JSON_BUILD_OBJECT(
                                               'author_id', a.author_id,
                                               'name', a.name
                                       )
                                               ) FILTER (WHERE a.author_id IS NOT NULL),
                                       '[]'
                       ) AS authors

                   FROM library_books lb

                            JOIN books b
                                 ON lb.book_id = b.book_id

                            LEFT JOIN book_authors ba
                                      ON b.book_id = ba.book_id

                            LEFT JOIN authors a
                                      ON ba.author_id = a.author_id

                   WHERE lb.library_book_id = $1

                   GROUP BY
                       lb.library_book_id,
                       lb.status,
                       b.book_id,
                       b.title`;

  const { rows } = await pool.query(query, [id]);
  return rows[0] ?? null;
}

/**
 * Adds a book to the library in the database.
 * @param {number} bookId - The ID of the book to add to the library.
 * @param {string} status - The status of the library book (e.g. 'want_to_read', 'reading', 'completed', 'dropped').
 * @returns {Promise<Object>} A promise that resolves to the added library book object.
 */
export async function addBookToLibrary(bookId, status) {
  const query =
    "INSERT INTO library_books (book_id, status) VALUES ($1, $2) RETURNING *";
  const { rows } = await pool.query(query, [bookId, status]);
  return rows[0];
}

/**
 * Updates a library book in the database.
 * @param {number} id - The ID of the library book to update.
 * @param {Object} updates - An object containing the properties to update.
 * @returns {Promise<Object>} A promise that resolves to the updated library book object.
 */
export async function updateLibraryBook(id, updates) {
  const { fields, values } = destructureAndValidate(updates);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(", ");

  const query = `UPDATE library_books SET ${setClause} WHERE library_book_id = $${values.length + 1} RETURNING *`;
  const { rows } = await pool.query(query, [...values, id]);
  return rows[0];
}

/**
 * Removes a book from the library in the database.
 * @param {number} id - The ID of the library book to remove.
 * @returns {Promise<void>} A promise that resolves when the book is removed from the library.
 */
export async function removeBookFromLibrary(id) {
  const query = "DELETE FROM library_books WHERE library_book_id = $1";
  await pool.query(query, [id]);
}
