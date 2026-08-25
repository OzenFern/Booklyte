/**
 * Routes for library-related operations.
 *
 * @module libraryRoutes
 */

import express from "express";
import {
  addBookToLibrary,
  displayNewLibraryBook,
  getAllLibraryBooks,
  getLibraryBookById,
  removeBookFromLibrary,
  showEditLibraryBookForm,
  putLibraryBook,
  patchLibraryBook,
  validateBookId,
} from "../controllers/libraryController.js";

const router = express.Router();

/**
 * GET /library
 * Display all library books.
 */
router.get("/", getAllLibraryBooks);

/**
 * GET /library/new
 * Display the form for adding a book to the library.
 */
router.get("/new", displayNewLibraryBook);

/**
 * POST /library
 * Add a book to the library.
 */
router.post("/", addBookToLibrary);

/**
 * GET /library/validate-book
 * Validate a book ID for the library form.
 */
router.get("/validate-book", validateBookId);

/**
 * GET /library/:id
 * Display a single library book.
 */
router.get("/:id", getLibraryBookById);

/**
 * GET /library/:id/edit
 * Display the form for editing a library book.
 */
router.get("/:id/edit", showEditLibraryBookForm);

/**
 * PUT /library/:id
 * Completely update a library book.
 */
router.put("/:id", putLibraryBook);

/**
 * PATCH /library/:id
 * Partially update a library book.
 */
router.patch("/:id", patchLibraryBook);

/**
 * DELETE /library/:id
 * Remove a book from the library.
 */
router.delete("/:id", removeBookFromLibrary);

export default router;
