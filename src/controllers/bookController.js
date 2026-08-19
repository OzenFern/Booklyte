/**
 * Controller for handling book-related operations.
 * Interfaces with HTTP requests and responses and uses the bookService
 * to perform operations on books.
 *
 * @module bookController
 */

import * as bookService from '../services/bookService.js';
import { handleControllerError } from '../utils/errorHandler.js';

/**
 * Handles the case when a book is not found.
 * @param req - The HTTP request object.
 * @param id - The ID of the book that was not found.
 * @param res - The HTTP response object.
 * @returns {*} Redirects to the books index page with an error flash message.
 */
function bookNotFound(req, id, res) {
    req.flash('error', `Book with ID ${id} not found.`);
    return res.redirect('/books');
}

/**
 * Retrieves all books and renders the books index page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function getAllBooks(req, res, next) {
    try {
        const books = await bookService.getAllBooks();

        res.render('books/index', {
            title: 'My Books',
            books,
        });
    } catch (error) {
        handleControllerError(error, req, next, 'Error retrieving books.');
    }
}

/**
 * Retrieves a book by its ID and renders the book details page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function getBookById(req, res, next) {
    const { id } = req.params;

    try {
        const book = await bookService.getBookById(id);

        if (!book) {
            return bookNotFound(req, id, res);
        }

        res.render('books/show', {
            title: book.title,
            book,
        });
    } catch (error) {
        handleControllerError(error, req, next, `Error retrieving book with ID ${id}.`);
    }
}

/**
 * Renders the form for creating a new book.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
export function showCreateBookForm(req, res) {
    res.render('books/new', {
        title: 'Add Book',
    });
}

/**
 * Creates a new book and redirects to the newly created book.
 * Expects req.body to contain book properties and optionally an authors array:
 * {
 *   openlibrary_id: string,
 *   title: string,
 *   description: string,
 *   cover_url: string,
 *   published_date: string,
 *   authors: [{ openlibrary_id: string, name: string }]
 * }
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function createBook(req, res, next) {
    try {
        const newBook = await bookService.createBook(req.body);

        req.flash('success', 'Book created successfully.');

        res.redirect(`/books/${newBook.book_id}`);
    } catch (error) {
        handleControllerError(error, req, next, 'Error creating book.');
    }
}

/**
 * Renders the form for editing an existing book.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function showEditBookForm(req, res, next) {
    const { id } = req.params;

    try {
        const book = await bookService.getBookById(id);

        if (!book) {
            return bookNotFound(req, id, res);
        }

        res.render('books/edit', {
            title: `Edit ${book.title}`,
            book,
        });
    } catch (error) {
        handleControllerError(error, req, next, `Error retrieving book with ID ${id}.`);
    }
}

/**
 * Completely updates an existing book and redirects to its details page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function updateBook(req, res, next) {
    const { id } = req.params;

    try {
        const updatedBook = await bookService.putBook(id, req.body);

        if (!updatedBook) {
            return bookNotFound(req, id, res);
        }

        req.flash('success', 'Book updated successfully.');

        res.redirect(`/books/${updatedBook.book_id}`);
    } catch (error) {
        handleControllerError(error, req, next, `Error updating book with ID ${id}.`);
    }
}

/**
 * Partially updates an existing book and redirects to its details page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function patchBook(req, res, next) {
    const { id } = req.params;

    try {
        const updatedBook = await bookService.patchBook(id, req.body);

        if (!updatedBook) {
            return bookNotFound(req, id, res);
        }

        req.flash('success', 'Book updated successfully.');

        res.redirect(`/books/${updatedBook.book_id}`);
    } catch (error) {
        handleControllerError(error, req, next, `Error partially updating book with ID ${id}.`);
    }
}

/**
 * Deletes an existing book and redirects to the books index page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function deleteBook(req, res, next) {
    const { id } = req.params;

    try {
        await bookService.deleteBook(id);

        req.flash('success', 'Book deleted successfully.');

        res.redirect('/books');
    } catch (error) {
        handleControllerError(error, req, next, `Error deleting book with ID ${id}.`);
    }
}
