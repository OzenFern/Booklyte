/**
 * This module provides functions to interact with the authors table in the database.
 * @module authorRepository
 */
import pool from '../db/pool.js';

/**
 * Finds an author by their Open Library ID.
 * @param {string} openLibraryId - The Open Library ID of the author to find.
 * @returns {Promise<Object|null>} A promise that resolves to the author object if found, or null if not found.
 */
export async function findByOpenLibraryId(openLibraryId) {
    const query = 'SELECT * FROM authors WHERE openlibrary_id = $1';
    const { rows } = await pool.query(query, [openLibraryId]);
    return rows[0] ?? null;
}

/**
 * Creates a new author in the database.
 * @param {Object} author - The author object to create.
 * @param {string} author.openlibrary_id - The Open Library ID of the author.
 * @param {string} author.name - The name of the author.
 * @returns {Promise<Object>} A promise that resolves to the created author object.
 */
export async function createAuthor(author) {
    const query = 'INSERT INTO authors (openlibrary_id, name) VALUES ($1, $2) RETURNING *';
    const values = [author.openlibrary_id, author.name];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

/**
 * Retrieves all authors for a specific book by the book's ID.
 * @param {number} bookId - The ID of the book to get authors for.
 * @returns {Promise<Array>} A promise that resolves to an array of author objects.
 */
export async function getAuthorsByBookId(bookId) {
    const query = `
        SELECT a.author_id, a.openlibrary_id, a.name, a.created_at
        FROM authors a
        INNER JOIN book_authors ba ON a.author_id = ba.author_id
        WHERE ba.book_id = $1
    `;
    const { rows } = await pool.query(query, [bookId]);
    return rows;
}

/**
 * Retrieves an author by their ID from the database.
 * @param {number} id - The ID of the author to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the author object if found, or null if not found.
 */
export async function getAuthorById(id) {
    const query = 'SELECT * FROM authors WHERE author_id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] ?? null;
}

/**
 * Retrieves all authors from the database.
 * @returns {Promise<Array>} A promise that resolves to an array of author objects.
 */
export async function getAllAuthors() {
    const query = 'SELECT * FROM authors';
    const { rows } = await pool.query(query);
    return rows;
}
