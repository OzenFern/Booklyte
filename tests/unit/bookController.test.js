/**
 * Unit tests for the book controller.
 *
 * The controller is validated by checking the response handling and redirect
 * behavior for each route without talking to the database.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as bookController from "../../src/controllers/bookController.js";

const mocks = vi.hoisted(() => ({
  getAllBooks: vi.fn(),
  getBookById: vi.fn(),
  createBook: vi.fn(),
  putBook: vi.fn(),
  patchBook: vi.fn(),
  deleteBook: vi.fn(),
  handleControllerError: vi.fn(),
}));

// Reference the functions from the hoisted mocks object to allow assertions on their calls.
vi.mock("../../src/services/bookService.js", () => ({
  getAllBooks: mocks.getAllBooks,
  getBookById: mocks.getBookById,
  createBook: mocks.createBook,
  putBook: mocks.putBook,
  patchBook: mocks.patchBook,
  deleteBook: mocks.deleteBook,
}));

vi.mock("../../src/utils/errorHandler.js", () => ({
  handleControllerError: mocks.handleControllerError,
}));

describe("bookController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllBooks renders the books index page with retrieved books", async () => {
    // Arrange: the service responds with a list of books.
    const books = [{ book_id: 1, title: "Dune" }];
    const req = {};
    const res = { render: vi.fn() };
    const next = vi.fn();
    mocks.getAllBooks.mockResolvedValue(books);

    // Act: call the controller action.
    await bookController.getAllBooks(req, res, next);

    // Assert: the controller renders the index template with the title and books payload.
    expect(mocks.getAllBooks).toHaveBeenCalledTimes(1);
    expect(res.render).toHaveBeenCalledWith("books/index", {
      title: "My Books",
      books,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("getBookById renders the book detail view when the book exists", async () => {
    // Arrange: the service finds a valid book for the supplied ID.
    const req = { params: { id: "42" } };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const book = { book_id: 42, title: "The Hobbit" };
    mocks.getBookById.mockResolvedValue(book);

    await bookController.getBookById(req, res, next);

    expect(res.render).toHaveBeenCalledWith("books/show", {
      title: book.title,
      book,
    });
  });

  it("getBookById redirects to the books list when the book is missing", async () => {
    // Arrange: the service returns null, which is treated as a not-found condition.
    const req = { params: { id: "99" }, flash: vi.fn() };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.getBookById.mockResolvedValue(null);

    await bookController.getBookById(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Book with ID 99 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/books");
    expect(next).not.toHaveBeenCalled();
  });

  it("showCreateBookForm renders the new-book form", () => {
    // Arrange: a plain request and response object.
    const req = {};
    const res = { render: vi.fn() };

    // Act: render the create form.
    bookController.showCreateBookForm(req, res);

    // Assert: the template should be the expected creation view.
    expect(res.render).toHaveBeenCalledWith("books/new", {
      title: "Add Book",
    });
  });

  it("createBook flashes success and redirects after creating the book", async () => {
    // Arrange: the create-call resolves to a saved book object.
    const req = {
      body: { title: "Dune", openlibrary_id: "OL1" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const newBook = { book_id: 5, title: "Dune" };
    mocks.createBook.mockResolvedValue(newBook);

    await bookController.createBook(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Book created successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/books/5");
  });

  it("showEditBookForm redirects when the book is missing", async () => {
    // Arrange: the service does not find the record for the requested ID.
    const req = { params: { id: "7" }, flash: vi.fn() };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.getBookById.mockResolvedValue(null);

    await bookController.showEditBookForm(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Book with ID 7 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/books");
  });

  it("updateBook flashes success and redirects to the updated book", async () => {
    // Arrange: the update operation resolves to a saved book object.
    const req = {
      params: { id: "8" },
      body: { title: "Updated title" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const updatedBook = { book_id: 8, title: "Updated title" };
    mocks.putBook.mockResolvedValue(updatedBook);

    await bookController.updateBook(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Book updated successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/books/8");
  });

  it("patchBook flashes success and redirects to the patched record", async () => {
    // Arrange: a partial update returns the changed book.
    const req = {
      params: { id: "9" },
      body: { title: "Patched title" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const patchedBook = { book_id: 9, title: "Patched title" };
    mocks.patchBook.mockResolvedValue(patchedBook);

    await bookController.patchBook(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Book updated successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/books/9");
  });

  it("deleteBook flashes success and redirects after deleting the book", async () => {
    // Arrange: the delete service completes without error.
    const req = {
      params: { id: "10" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.deleteBook.mockResolvedValue(undefined);

    await bookController.deleteBook(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Book deleted successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/books");
  });

  it("controller errors are delegated to the shared error handler", async () => {
    // Arrange: the service rejects so the controller can forward the error.
    const req = { params: { id: "11" }, flash: vi.fn() };
    const res = { render: vi.fn(), redirect: vi.fn() };
    const next = vi.fn();
    const error = new Error("Service exploded");
    mocks.getBookById.mockRejectedValue(error);

    await bookController.getBookById(req, res, next);

    expect(mocks.handleControllerError).toHaveBeenCalledWith(
      error,
      req,
      next,
      "Error retrieving book with ID 11.",
    );
  });
});
