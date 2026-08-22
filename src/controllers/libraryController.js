/**
 * Controller for handling library-related operations.
 * Interfaces with HTTP requests and responses and uses the libraryService
 * to perform operations on library books.
 *
 * @module libraryController
 */

import * as ls from "../services/libraryService.js";
import { handleControllerError } from "../utils/errorHandler.js";

/**
 * Handles the case when a library book is not found.
 * @param req - The HTTP request object.
 * @param id - The ID of the library book that was not found.
 * @param res - The HTTP response object.
 * @returns {*} Redirects to the library index page with an error flash message.
 */
function libraryBookNotFound(req, id, res) {
  req.flash("error", `Library book with ID ${id} not found.`);
  return res.redirect("/library");
}

/**
 * Retrieves all library books and renders the library index page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function getAllLibraryBooks(req, res, next) {
  try {
    const libraryBooks = await ls.getAllLibraryBooks();

    res.render("library/index", {
      title: "My Library",
      libraryBooks,
    });
  } catch (error) {
    handleControllerError(error, req, next, "Error retrieving library books.");
  }
}

/**
 * Retrieves a library book by its ID and renders the library book details page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function getLibraryBookById(req, res, next) {
  const { id } = req.params;

  try {
    const libraryBook = await ls.getLibraryBookById(id);

    if (!libraryBook) {
      return libraryBookNotFound(req, id, res);
    }

    res.render("library/show", {
      title: libraryBook.title,
      libraryBook,
    });
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error retrieving library book with ID ${id}.`,
    );
  }
}

/**
 * Adds a book to the library and redirects to the library index page.
 * Expects req.body to contain:
 * {
 *   book_id: number,
 *   status: string
 * }
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function addBookToLibrary(req, res, next) {
  try {
    const { book_id, status } = req.body;
    const newLibraryBook = await ls.addBookToLibrary(
      book_id,
      status,
    );

    req.flash("success", "Book added to library successfully.");

    res.redirect(`/library/${newLibraryBook.library_book_id}`);
  } catch (error) {
    handleControllerError(error, req, next, "Error adding book to library.");
  }
}

/**
 * Renders the form for editing an existing library book.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function showEditLibraryBookForm(req, res, next) {
  const { id } = req.params;

  try {
    const libraryBook = await ls.getLibraryBookById(id);

    if (!libraryBook) {
      return libraryBookNotFound(req, id, res);
    }

    res.render("library/edit", {
      title: `Edit ${libraryBook.title}`,
      libraryBook,
    });
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error retrieving library book with ID ${id}.`,
    );
  }
}

/**
 * Completely updates a library book and redirects to its details page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function putLibraryBook(req, res, next) {
  const { id } = req.params;

  try {
    const updatedLibraryBook = await ls.updateLibraryBook(
      id,
      req.body,
      false,
    );

    if (!updatedLibraryBook) {
      return libraryBookNotFound(req, id, res);
    }

    req.flash("success", "Library book updated successfully.");

    res.redirect(`/library/${updatedLibraryBook.library_book_id}`);
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error updating library book with ID ${id}.`,
    );
  }
}

/**
 * Partially updates a library book and redirects to its details page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function patchLibraryBook(req, res, next) {
  const { id } = req.params;

  try {
    const updatedLibraryBook = await ls.updateLibraryBook(
      id,
      req.body,
    );

    if (!updatedLibraryBook) {
      return libraryBookNotFound(req, id, res);
    }

    if (req.get("HX-Request")) {
      const libraryBook = await ls.getLibraryBookById(
        updatedLibraryBook.library_book_id,
      );
      return res.render("library/partials/book-row", { libraryBook });
    }

    req.flash("success", "Library book updated successfully.");

    res.redirect(`/library/${updatedLibraryBook.library_book_id}`);
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error partially updating library book with ID ${id}.`,
    );
  }
}

/**
 * Removes a book from the library and redirects to the library index page.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function removeBookFromLibrary(req, res, next) {
  const { id } = req.params;

  try {
    const deletedLibraryBook = await ls.removeBookFromLibrary(id);

    if (req.get("HX-Request")) {
      if (!deletedLibraryBook) {
        return libraryBookNotFound(req, id, res);
      }
      return res.status(204).send("");
    }

    req.flash("success", "Book removed from library successfully.");

    res.redirect("/library");
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error removing library book with ID ${id}.`,
    );
  }
}

/**
 * Renders the form for adding a new book to the library.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
export function displayNewLibraryBook(req, res) {
  res.render("library/new", {
    title: "Add Book to Library",
  });
}
