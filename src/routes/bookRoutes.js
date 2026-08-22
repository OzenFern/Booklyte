/**
 * Routes for book-related operations.
 *
 * @module bookRoutes
 */

import express from "express";
import {
  getAllBooks,
  getBookById,
  showCreateBookForm,
  createBook,
  showEditBookForm,
  updateBook,
  patchBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

/**
 * GET /books
 * Display all books.
 */
router.get("/", getAllBooks);

/**
 * GET /books/new
 * Display the form for creating a new book.
 */
router.get("/new", showCreateBookForm);

/**
 * POST /books
 * Create a new book.
 */
router.post("/", createBook);

/**
 * GET /books/:id
 * Display a single book.
 */
router.get("/:id", getBookById);

/**
 * GET /books/:id/edit
 * Display the form for editing a book.
 */
router.get("/:id/edit", showEditBookForm);

/**
 * PUT /books/:id
 * Completely update a book.
 */
router.put("/:id", updateBook);

/**
 * PATCH /books/:id
 * Partially update a book.
 */
router.patch("/:id", patchBook);

/**
 * DELETE /books/:id
 * Delete a book.
 */
router.delete("/:id", deleteBook);

export default router;
