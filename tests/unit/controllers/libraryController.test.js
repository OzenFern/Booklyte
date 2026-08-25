/**
 * Unit tests for the library controller.
 *
 * The controller is validated by checking the response handling and redirect
 * behavior for each route without talking to the database.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as libraryController from "../../../src/controllers/libraryController.js";

const mocks = vi.hoisted(() => ({
  getAllLibraryBooks: vi.fn(),
  getLibraryBookById: vi.fn(),
  addBookToLibrary: vi.fn(),
  updateLibraryBook: vi.fn(),
  removeBookFromLibrary: vi.fn(),
  handleControllerError: vi.fn(),
}));

// Reference the functions from the hoisted mocks object to allow assertions on their calls.
vi.mock("../../../src/services/libraryService.js", () => ({
  getAllLibraryBooks: mocks.getAllLibraryBooks,
  getLibraryBookById: mocks.getLibraryBookById,
  addBookToLibrary: mocks.addBookToLibrary,
  updateLibraryBook: mocks.updateLibraryBook,
  removeBookFromLibrary: mocks.removeBookFromLibrary,
}));

vi.mock("../../../src/utils/errorHandler.js", () => ({
  handleControllerError: mocks.handleControllerError,
}));

describe("libraryController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllLibraryBooks renders the library index page with retrieved library books", async () => {
    // Arrange: the service responds with a list of library books.
    const libraryBooks = [
      {
        library_book_id: 1,
        book_id: 42,
        title: "Dune",
        status: "reading",
        authors: [{ author_id: 1, name: "Frank Herbert" }],
      },
    ];
    const req = {};
    const res = { render: vi.fn() };
    const next = vi.fn();
    mocks.getAllLibraryBooks.mockResolvedValue(libraryBooks);

    // Act: call the controller action.
    await libraryController.getAllLibraryBooks(req, res, next);

    // Assert: the controller renders the index template with the title and library books payload.
    expect(mocks.getAllLibraryBooks).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith("library/index", {
      title: "My Library",
      libraryBooks,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("getAllLibraryBooks forwards a title or author search query", async () => {
    const libraryBooks = [];
    const req = { query: { q: "  Herbert  " } };
    const res = { render: vi.fn() };
    const next = vi.fn();
    mocks.getAllLibraryBooks.mockResolvedValue(libraryBooks);

    await libraryController.getAllLibraryBooks(req, res, next);

    expect(mocks.getAllLibraryBooks).toHaveBeenCalledWith("Herbert");
    expect(res.render).toHaveBeenCalledWith("library/index", {
      title: "My Library",
      libraryBooks,
      searchQuery: "Herbert",
    });
  });

  it("getLibraryBookById renders the library book detail view when the library book exists", async () => {
    // Arrange: the service finds a valid library book for the supplied ID.
    const req = { params: { id: "1" } };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const libraryBook = {
      library_book_id: 1,
      book_id: 42,
      title: "The Hobbit",
      status: "completed",
      authors: [{ author_id: 2, name: "J.R.R. Tolkien" }],
    };
    mocks.getLibraryBookById.mockResolvedValue(libraryBook);

    await libraryController.getLibraryBookById(req, res, next);

    expect(res.render).toHaveBeenCalledWith("library/show", {
      title: libraryBook.title,
      libraryBook,
    });
  });

  it("getLibraryBookById redirects to the library list when the library book is missing", async () => {
    // Arrange: the service returns null, which is treated as a not-found condition.
    const req = { params: { id: "99" }, flash: vi.fn() };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.getLibraryBookById.mockResolvedValue(null);

    await libraryController.getLibraryBookById(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Library book with ID 99 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library");
    expect(next).not.toHaveBeenCalled();
  });

  it("addBookToLibrary flashes success and redirects after adding the book to library", async () => {
    // Arrange: the add call resolves to a saved library book object.
    const req = {
      body: { book_id: 42, status: "want_to_read" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const newLibraryBook = {
      library_book_id: 5,
      book_id: 42,
      status: "want_to_read",
    };
    mocks.addBookToLibrary.mockResolvedValue(newLibraryBook);

    await libraryController.addBookToLibrary(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Book added to library successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("showEditLibraryBookForm redirects when the library book is missing", async () => {
    // Arrange: the service does not find the record for the requested ID.
    const req = { params: { id: "7" }, flash: vi.fn() };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.getLibraryBookById.mockResolvedValue(null);

    await libraryController.showEditLibraryBookForm(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Library book with ID 7 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library");
  });

  it("showEditLibraryBookForm renders the edit form when the library book exists", async () => {
    // Arrange: the service finds a valid library book for the supplied ID.
    const req = { params: { id: "1" } };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const libraryBook = {
      library_book_id: 1,
      book_id: 42,
      title: "Dune",
      status: "reading",
      authors: [{ author_id: 1, name: "Frank Herbert" }],
    };
    mocks.getLibraryBookById.mockResolvedValue(libraryBook);

    await libraryController.showEditLibraryBookForm(req, res, next);

    expect(res.render).toHaveBeenCalledWith("library/edit", {
      title: "Edit Dune",
      libraryBook,
    });
  });

  it("putLibraryBook flashes success and redirects to the updated library book", async () => {
    // Arrange: the complete update operation resolves to a saved library book object.
    const req = {
      params: { id: "1" },
      body: { book_id: 42, status: "completed" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const updatedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "completed",
    };
    mocks.updateLibraryBook.mockResolvedValue(updatedLibraryBook);

    await libraryController.putLibraryBook(req, res, next);

    expect(mocks.updateLibraryBook).toHaveBeenCalledWith("1", req.body, false);
    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Library book updated successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/1");
  });

  it("putLibraryBook redirects when the library book is missing", async () => {
    // Arrange: the service returns null for the complete update operation.
    const req = {
      params: { id: "99" },
      body: { book_id: 42, status: "completed" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.updateLibraryBook.mockResolvedValue(null);

    await libraryController.putLibraryBook(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Library book with ID 99 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library");
  });

  it("patchLibraryBook flashes success and redirects to the updated library book", async () => {
    // Arrange: the partial update operation resolves to a saved library book object.
    const req = {
      params: { id: "1" },
      body: { status: "completed" },
      flash: vi.fn(),
      get: vi.fn().mockReturnValue(undefined),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const updatedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "completed",
    };
    mocks.updateLibraryBook.mockResolvedValue(updatedLibraryBook);

    await libraryController.patchLibraryBook(req, res, next);

    expect(mocks.updateLibraryBook).toHaveBeenCalledWith("1", req.body);
    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Library book updated successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/1");
  });

  it("patchLibraryBook redirects when the library book is missing", async () => {
    // Arrange: the service returns null for the partial update operation.
    const req = {
      params: { id: "99" },
      body: { status: "completed" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.updateLibraryBook.mockResolvedValue(null);

    await libraryController.patchLibraryBook(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Library book with ID 99 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library");
  });

  it("removeBookFromLibrary flashes success and redirects after removing the book", async () => {
    // Arrange: the remove service completes without error.
    const req = {
      params: { id: "1" },
      flash: vi.fn(),
      get: vi.fn().mockReturnValue(undefined),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.removeBookFromLibrary.mockResolvedValue(undefined);

    await libraryController.removeBookFromLibrary(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Book removed from library successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library");
  });

  it("controller errors are delegated to the shared error handler", async () => {
    // Arrange: the service rejects so the controller can forward the error.
    const req = { params: { id: "1" }, flash: vi.fn() };
    const res = { render: vi.fn(), redirect: vi.fn() };
    const next = vi.fn();
    const error = new Error("Service exploded");
    mocks.getLibraryBookById.mockRejectedValue(error);

    await libraryController.getLibraryBookById(req, res, next);

    expect(mocks.handleControllerError).toHaveBeenCalledWith(
      error,
      req,
      next,
      "Error retrieving library book with ID 1.",
    );
  });

  it("patchLibraryBook renders partial for HTMX requests", async () => {
    // Arrange: the partial update operation resolves to a saved library book object.
    const req = {
      params: { id: "1" },
      body: { status: "completed" },
      get: vi.fn().mockReturnValue("true"),
    };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const updatedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "completed",
    };
    const libraryBook = {
      library_book_id: 1,
      book_id: 42,
      title: "Dune",
      status: "completed",
      authors: [{ author_id: 1, name: "Frank Herbert" }],
    };
    mocks.updateLibraryBook.mockResolvedValue(updatedLibraryBook);
    mocks.getLibraryBookById.mockResolvedValue(libraryBook);

    await libraryController.patchLibraryBook(req, res, next);

    expect(mocks.updateLibraryBook).toHaveBeenCalledWith("1", req.body);
    expect(res.render).toHaveBeenCalledWith("library/partials/book-row", {
      libraryBook,
    });
  });

  it("removeBookFromLibrary removes the row for HTMX requests", async () => {
    // Arrange: the remove service completes without error.
    const req = {
      params: { id: "1" },
      get: vi.fn().mockReturnValue("true"),
    };
    const res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    };
    const next = vi.fn();
    const deletedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
    };
    mocks.removeBookFromLibrary.mockResolvedValue(deletedLibraryBook);

    await libraryController.removeBookFromLibrary(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith("");
  });
});
