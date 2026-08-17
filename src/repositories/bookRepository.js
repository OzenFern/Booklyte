/**
 * This module provides functions to interact with the books table in the database.
 * @module bookRepository
 */
import pool from '../db/pool.js';

/**
 * Retrieves all books from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of book objects.
 */
export async function getAllBooks() {
    const query = 'SELECT * FROM books';
    const { rows } = await pool.query(query);
    return rows;
}

/**
 * Retrieves a book by its ID from the database.
 * @param {number} id - The ID of the book to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the book object if found, or null if not found.
 */
export async function getBookById(id) {
    const query = 'SELECT * FROM books WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] ?? null;
}

/**
 * Creates a new book in the database.
 * @param {Object} book - The book object to create.
 * @param {string} book.openlibrary_id - The Open Library ID of the book.
 * @param {string} book.title - The title of the book.
 * @param {string} book.description - The description of the book.
 * @param {string} book.cover_url - The URL of the book's cover image.
 * @param {string} book.published_date - The published date of the book.
 * @returns {Promise<Object>} A promise that resolves to the created book object.
 */
export async function createBook(book) {
    const query = 'INSERT INTO books (openlibrary_id, title,description,cover_url, published_date) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [book.openlibrary_id, book.title, book.description, book.cover_url, book.published_date];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

/**
 * Completely updates an existing book in the database.
 * @param {number} id - The ID of the book to update.
 * @param {Object} book - The book object with updated properties.
 * @param {string} book.openlibrary_id - The Open Library ID of the book.
 * @param {string} book.title - The title of the book.
 * @param {string} book.description - The description of the book.
 * @param {string} book.cover_url - The URL of the book's cover image.
 * @param {string} book.published_date - The published date of the book.
 * @returns {Promise<Object|null>} A promise that resolves to the updated book object if found, or null if not found.
 */
export async function putBook(id, book) {
    const query = 'UPDATE books SET openlibrary_id = $1, title = $2, description = $3, cover_url = $4, published_date = $5 WHERE id = $6 RETURNING *';
    const values = [book.openlibrary_id, book.title, book.description, book.cover_url, book.published_date, id];

    const { rows } = await pool.query(query, values);
    return rows[0] ?? null;
}

/**
 * Partially updates an existing book in the database.
 * @param {number} id - The ID of the book to update.
 * @param {Object} book - The book object with updated properties.
 * @returns {Promise<Object|null>} A promise that resolves to the updated book object if found, or null if not found.
 */
export async function patchBook(id, book) {
    const fields = Object.keys(book);
    const values = Object.values(book);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    // Add the id as the last parameter for the WHERE clause
    values.push(id);
    const query = `UPDATE books SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

    const { rows } = await pool.query(query, values);
    return rows[0] ?? null;
}

/**
 * Deletes a book from the database.
 * @param {number} book_id - The ID of the book to delete.
 * @returns {Promise<Object|null>} A promise that resolves to the deleted book object if found, or null if not found.
 */
export async function deleteBook(book_id) {
    const query = 'DELETE FROM books WHERE id = $1 RETURNING *';

    const { rows } = await pool.query(query, [book_id]);
    return rows[0] ?? null;
}