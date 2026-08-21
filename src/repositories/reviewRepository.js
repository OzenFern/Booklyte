/**
 * This module provides functions to interact with the reviews table in the database.
 * @module reviewRepository
 */
import pool from '../db/pool.js';
import {destructureAndValidate} from "../utils/validationHandler.js";

/**
 * Retrieves a review by its library book ID from the database.
 * @param {number} libraryBookId - The library book ID to retrieve the review for.
 * @returns {Promise<Object|null>} A promise that resolves to the review object if found, or null if not found.
 */
export async function getReviewByLibraryBookId(libraryBookId) {
    const query = 'SELECT * FROM reviews WHERE library_book_id = $1';
    const { rows } = await pool.query(query, [libraryBookId]);
    return rows[0] ?? null;
}

/**
 * Retrieves a review by its ID from the database.
 * @param {number} id - The ID of the review to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the review object if found, or null if not found.
 */
export async function getReviewById(id) {
    const query = 'SELECT * FROM reviews WHERE review_id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] ?? null;
}

/**
 * Creates a new review in the database.
 * @param {Object} review - The review object to create.
 * @param {number} review.library_book_id - The library book ID the review is for.
 * @param {number} review.rating - The rating of the book (0-5).
 * @param {string} review.review_text - The text content of the review.
 * @returns {Promise<Object>} A promise that resolves to the created review object.
 */
export async function createReview(review) {
    const query =
        'INSERT INTO reviews (library_book_id, rating, review_text) VALUES ($1, $2, $3) RETURNING *';
    const values = [
        review.library_book_id,
        review.rating,
        review.review_text,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

/**
 * Updates an existing review in the database.
 * @param {number} id - The ID of the review to update.
 * @param {Object} review - The review object with updated properties.
 * @returns {Promise<Object|null>} A promise that resolves to the updated review object if found, or null if not found.
 */
export async function updateReview(id, review) {
    const {fields, values} = destructureAndValidate(review);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    // Add the id as the last parameter for the WHERE clause
    values.push(id);
    const query = `UPDATE reviews SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE review_id = $${fields.length + 1} RETURNING *`;

    const { rows } = await pool.query(query, values);
    return rows[0] ?? null;
}

/**
 * Deletes a review from the database.
 * @param {number} id - The ID of the review to delete.
 * @returns {Promise<Object|null>} A promise that resolves to the deleted review object if found, or null if not found.
 */
export async function deleteReview(id) {
    const query = 'DELETE FROM reviews WHERE review_id = $1 RETURNING *';

    const { rows } = await pool.query(query, [id]);
    return rows[0] ?? null;
}
