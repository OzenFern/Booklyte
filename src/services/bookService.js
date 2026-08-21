/**
 * This module provides service functions for managing books in the database.
 * It acts as an intermediary between the controllers and the book repository.
 * @module bookService
 */
import * as bk from '../repositories/bookRepository.js';
import pool from "../db/pool.js";
import {handleServiceError} from '../utils/errorHandler.js';
import {associateAuthorWithBook, createAuthor, findByOpenLibraryId} from "../repositories/authorRepository.js";

/**
 * Retrieves all books from the database.
 * @returns {Promise<Array | Object>} A promise that resolves to an array of book objects with authors or an error object if not found.
 */
export async function getAllBooks() {
    try {
        const books = await bk.getAllBooks();
        // Parse JSON strings for authors that come from PostgreSQL
        return books.map(book => ({
            ...book,
            authors: typeof book.authors === 'string' ? JSON.parse(book.authors) : book.authors
        }));
    } catch (error) {
        return handleServiceError(error, 'Failed to fetch books.');
    }
}

/**
 * Retrieves a book by its ID from the database.
 * @param {number} id - The ID of the book to retrieve.
 * @returns {Promise<Object|null>} A promise that resolves to the book object with authors if found, or null if not found.
 */
export async function getBookById(id) {
    try {
        const book = await bk.getBookById(id);
        if (book) {
            // Parse JSON string for authors that comes from PostgreSQL
            return {
                ...book,
                authors: typeof book.authors === 'string' ? JSON.parse(book.authors) : book.authors
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
            await client.query('BEGIN');

            // Create the book
            const createdBook = await bk.createBook(book);

            // If authors are provided, create them and associate with the book
            if (book.authors && Array.isArray(book.authors)) {
                for (const author of book.authors) {
                    let existingAuthor = await findByOpenLibraryId(author.openlibrary_id);
                    if (!existingAuthor) {
                        existingAuthor = await createAuthor(author);
                    }
                    // Associate the author with the book
                    await associateAuthorWithBook(existingAuthor.author_id, createdBook.book_id);
                }
            }
            await client.query('COMMIT');

            // Fetch the created book with authors using the updated repository function
            return await bk.getBookById(createdBook.book_id);
        } catch (error) {
            await client.query('ROLLBACK');
            return handleServiceError(error, 'Failed to create book.');
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
        return await bk.deleteBook(id);
    } catch (error) {
        return handleServiceError(error, `Failed to delete book with id ${id}.`);
    }
}
