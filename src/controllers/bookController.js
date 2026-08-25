/**
 * Controller for handling book-related operations.
 * Interfaces with HTTP requests and responses and uses the bookService
 * to perform operations on books.
 *
 * @module bookController
 */

import * as bs from "../services/bookService.js";
import * as ls from "../services/libraryService.js";
import { handleControllerError } from "../utils/errorHandler.js";

/**
 * Handles the case when a book is not found.
 * @param req - The HTTP request object.
 * @param id - The ID of the book that was not found.
 * @param res - The HTTP response object.
 * @returns {*} Redirects to the books index page with an error flash message.
 */
function bookNotFound(req, id, res) {
  req.flash("error", `Book with ID ${id} not found.`);
  return res.redirect("/books");
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
    const books = await bs.getAllBooks();

    // Check library status for each book
    const booksWithLibraryStatus = await Promise.all(
      books.map(async (book) => {
        const inLibrary = await ls.isBookInLibrary(book.book_id);
        return {
          ...book,
          in_library: inLibrary === true, // Handle both boolean and error object
        };
      }),
    );

    res.render("books/index", {
      title: "My Books",
      books: booksWithLibraryStatus,
    });
  } catch (error) {
    handleControllerError(error, req, next, "Error retrieving books.");
  }
}

/**
 * Returns a single book card HTML for HTMX refresh.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function getBookCard(req, res, next) {
  const { id } = req.params;

  try {
    const book = await bs.getBookById(id);

    if (!book) {
      return bookNotFound(req, id, res);
    }

    // Check if book is already in library
    const inLibrary = await ls.isBookInLibrary(book.book_id);

    res.render("partials/book-card", {
      book: {
        ...book,
        in_library: inLibrary === true,
      },
    });
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error retrieving book card with ID ${id}.`,
    );
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
    const book = await bs.getBookById(id);

    if (!book) {
      return bookNotFound(req, id, res);
    }

    // Check if book is already in library
    const inLibrary = await ls.isBookInLibrary(book.book_id);

    res.render("books/show", {
      title: book.title,
      book: {
        ...book,
        in_library: inLibrary === true,
      },
    });
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error retrieving book with ID ${id}.`,
    );
  }
}

/**
 * Renders the form for creating a new book.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 */
export function showCreateBookForm(req, res) {
  res.render("books/new", {
    title: "Add Book",
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
    const newBook = await bs.createBook(req.body);

    req.flash("success", "Book created successfully.");

    res.redirect(`/books/${newBook.book_id}`);
  } catch (error) {
    handleControllerError(error, req, next, "Error creating book.");
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
    const book = await bs.getBookById(id);

    if (!book) {
      return bookNotFound(req, id, res);
    }

    res.render("books/edit", {
      title: `Edit ${book.title}`,
      book,
    });
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error retrieving book with ID ${id}.`,
    );
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
    const updatedBook = await bs.putBook(id, req.body);

    if (!updatedBook) {
      return bookNotFound(req, id, res);
    }

    req.flash("success", "Book updated successfully.");

    res.redirect(`/books/${updatedBook.book_id}`);
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error updating book with ID ${id}.`,
    );
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
    const updatedBook = await bs.patchBook(id, req.body);

    if (!updatedBook) {
      return bookNotFound(req, id, res);
    }

    req.flash("success", "Book updated successfully.");

    res.redirect(`/books/${updatedBook.book_id}`);
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error partially updating book with ID ${id}.`,
    );
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
    await bs.deleteBook(id);

    req.flash("success", "Book deleted successfully.");

    res.redirect("/books");
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error deleting book with ID ${id}.`,
    );
  }
}

/**
 * Searches for books in the external Open Library database and renders the search results page.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 * @returns {Promise<void>}
 */
export async function searchExternalBooks(req, res, next) {
  const { q } = req.query;
  try {
    const normalizedQuery = typeof q === "string" ? q.trim() : "";
    const results = normalizedQuery
      ? await bs.searchExternalBooks(normalizedQuery)
      : [];

    if (req.get("HX-Request")) {
      return res.render("books/partials/results", {
        results,
        query: normalizedQuery,
      });
    }

    res.render("books/search_results", {
      title: `Search: ${normalizedQuery || "Books"}`,
      results,
      query: normalizedQuery,
    });
  } catch (error) {
    handleControllerError(error, req, next, "Error searching external books.");
  }
}

/**
 * Imports a book from the external Open Library database and redirects to the newly created book.
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 * @returns {Promise<void>}
 */
export async function importBook(req, res, next) {
  const { openLibraryId } = req.params;
  try {
    const created = await bs.importBookFromOpenLibrary(openLibraryId);
    if (req.get("HX-Request")) {
      return res.render("books/partials/import-action", {
        externalBook: { openlibrary_id: openLibraryId },
        importedBook: created,
      });
    }

    req.flash("success", "Book imported successfully.");
    res.redirect(`/books/${created.book_id}`);
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      "Error importing book from Open Library.",
    );
  }
}
