/**
 * Routes for library-related operations.
 *
 * @module libraryRoutes
 */

import express from 'express';
import {
    getAllLibraryBooks,
    getLibraryBookById,
    addBookToLibrary,
    showEditLibraryBookForm,
    updateLibraryBook,
    removeBookFromLibrary,
} from '../controllers/libraryController.js';

const router = express.Router();

/**
 * GET /library
 * Display all library books.
 */
router.get('/', getAllLibraryBooks);

/**
 * GET /library/new
 * Display the form for adding a book to the library.
 */
router.get('/new', (req, res) => {
    res.render('library/new', {
        title: 'Add Book to Library',
    });
});

/**
 * POST /library
 * Add a book to the library.
 */
router.post('/', addBookToLibrary);

/**
 * GET /library/:id
 * Display a single library book.
 */
router.get('/:id', getLibraryBookById);

/**
 * GET /library/:id/edit
 * Display the form for editing a library book.
 */
router.get('/:id/edit', showEditLibraryBookForm);

/**
 * PUT /library/:id
 * Update a library book.
 */
router.put('/:id', updateLibraryBook);

/**
 * PATCH /library/:id
 * Partially update a library book.
 */
router.patch('/:id', updateLibraryBook);

/**
 * DELETE /library/:id
 * Remove a book from the library.
 */
router.delete('/:id', removeBookFromLibrary);

export default router;
