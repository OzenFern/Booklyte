/**
 * Controller for handling book-related operations.
 * Interfaces with HTTP requests and responses and uses the bookService
 * to perform operations on books.
 *
 * @module bookController
 */

import * as bookService from '../services/bookService.js';

/*
 * TODO:
 * Create the following EJS views:
 *
 * src/views/books/index.ejs
 * src/views/books/show.ejs
 * src/views/books/new.ejs
 * src/views/books/edit.ejs
 *
 * TODO:
 * Create reusable view partials:
 *
 * src/views/partials/flash.ejs
 *
 * TODO:
 * Add proper frontend handling for:
 * - success flash messages
 * - error flash messages
 * - validation errors
 */

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
        req.flash('error', 'Error retrieving books.');
        next(error);
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

        res.render('books/show', {
            title: book.title,
            book,
        });
    } catch (error) {
        req.flash('error', `Error retrieving book with ID ${id}.`);
        next(error);
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
        req.flash('error', 'Error creating book.');
        next(error);
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

        res.render('books/edit', {
            title: `Edit ${book.title}`,
            book,
        });
    } catch (error) {
        req.flash('error', `Error retrieving book with ID ${id}.`);
        next(error);
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
        const updatedBook = await bookService.updateBook(id, req.body);

        req.flash('success', 'Book updated successfully.');

        res.redirect(`/books/${updatedBook.book_id}`);
    } catch (error) {
        req.flash('error', `Error updating book with ID ${id}.`);
        next(error);
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

        req.flash('success', 'Book updated successfully.');

        res.redirect(`/books/${updatedBook.book_id}`);
    } catch (error) {
        req.flash('error', `Error partially updating book with ID ${id}.`);
        next(error);
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
        req.flash('error', `Error deleting book with ID ${id}.`);
        next(error);
    }
}
