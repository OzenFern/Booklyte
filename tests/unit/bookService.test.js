/**
 * Unit tests for the book service layer.
 *
 * These tests validate the service's data flow and transaction handling while
 * allowing repository and database calls to be mocked.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as bookService from "../../src/services/bookService.js";

// Hoist the mocks to ensure they are available before the service module is imported.
const mocks = vi.hoisted(() => ({
  getAllBooks: vi.fn(),
  getBookById: vi.fn(),
  createBook: vi.fn(),
  putBook: vi.fn(),
  patchBook: vi.fn(),
  deleteBook: vi.fn(),
  findByOpenLibraryId: vi.fn(),
  createAuthor: vi.fn(),
  associateAuthorWithBook: vi.fn(),
  handleServiceError: vi.fn((error, message) => ({
    success: false,
    message,
    error: error instanceof Error ? error.message : "Unknown error",
  })),
  connect: vi.fn(),
}));

vi.mock("../../src/db/pool.js", () => ({
  default: {
    connect: mocks.connect,
  },
}));

vi.mock("../../src/repositories/bookRepository.js", () => ({
  getAllBooks: mocks.getAllBooks,
  getBookById: mocks.getBookById,
  createBook: mocks.createBook,
  putBook: mocks.putBook,
  patchBook: mocks.patchBook,
  deleteBook: mocks.deleteBook,
}));

vi.mock("../../src/repositories/authorRepository.js", () => ({
  findByOpenLibraryId: mocks.findByOpenLibraryId,
  createAuthor: mocks.createAuthor,
  associateAuthorWithBook: mocks.associateAuthorWithBook,
}));

vi.mock("../../src/utils/errorHandler.js", () => ({
  handleServiceError: mocks.handleServiceError,
}));

describe("bookService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllBooks delegates to the repository and returns its result with parsed authors", async () => {
    // Arrange: the repository resolves with a list of books including authors as JSON string.
    const books = [
      {
        book_id: 1,
        title: "Dune",
        authors:
          '[{"author_id": 1, "name": "Frank Herbert", "openlibrary_id": "OL1"}]',
      },
    ];
    const expectedBooks = [
      {
        book_id: 1,
        title: "Dune",
        authors: [
          { author_id: 1, name: "Frank Herbert", openlibrary_id: "OL1" },
        ],
      },
    ];
    mocks.getAllBooks.mockResolvedValue(books);

    // Act/Assert: the service should parse the JSON authors field.
    await expect(bookService.getAllBooks()).resolves.toEqual(expectedBooks);
    expect(mocks.getAllBooks).toHaveBeenCalledTimes(1);
  });

  it("getBookById returns the found book with parsed authors or forwards the repository error", async () => {
    // Arrange: the repository resolves a matching book with authors as JSON string.
    const book = {
      book_id: 42,
      title: "The Hobbit",
      authors:
        '[{"author_id": 2, "name": "J.R.R. Tolkien", "openlibrary_id": "OL2"}]',
    };
    const expectedBook = {
      book_id: 42,
      title: "The Hobbit",
      authors: [
        { author_id: 2, name: "J.R.R. Tolkien", openlibrary_id: "OL2" },
      ],
    };
    mocks.getBookById.mockResolvedValue(book);

    await expect(bookService.getBookById(42)).resolves.toEqual(expectedBook);
    expect(mocks.getBookById).toHaveBeenCalledWith(42);

    // Arrange: a repository failure should be normalized to a service error payload.
    const error = new Error("Lookup failed");
    mocks.getBookById.mockRejectedValueOnce(error);

    await expect(bookService.getBookById(99)).resolves.toEqual({
      success: false,
      message: "Failed to fetch book with id 99.",
      error: "Lookup failed",
    });
  });

  it("createBook creates the book and associates any supplied authors", async () => {
    // Arrange: a database client is available and the book has a single author record.
    const client = {
      query: vi.fn(),
      release: vi.fn(),
    };
    const bookPayload = {
      openlibrary_id: "OL1234M",
      title: "Dune",
      description: "Epic desert saga",
      cover_url: "https://example.com/dune.jpg",
      published_date: "1965-08-01",
      authors: [{ openlibrary_id: "OLA1", name: "Frank Herbert" }],
    };
    const createdBook = { book_id: 12, ...bookPayload };
    const bookWithAuthors = {
      book_id: 12,
      openlibrary_id: "OL1234M",
      title: "Dune",
      description: "Epic desert saga",
      cover_url: "https://example.com/dune.jpg",
      published_date: "1965-08-01",
      authors: [
        { author_id: 7, name: "Frank Herbert", openlibrary_id: "OLA1" },
      ],
    };

    mocks.connect.mockResolvedValue(client);
    mocks.createBook.mockResolvedValue(createdBook);
    mocks.findByOpenLibraryId.mockResolvedValue(null);
    mocks.createAuthor.mockResolvedValue({
      author_id: 7,
      openlibrary_id: "OLA1",
      name: "Frank Herbert",
    });
    mocks.getBookById.mockResolvedValue(bookWithAuthors);

    // Act: create the book within the service transaction.
    const result = await bookService.createBook(bookPayload);

    // Assert: transaction lifecycle, author creation, and relationship insertion.
    expect(client.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mocks.createBook).toHaveBeenCalledWith(bookPayload);
    expect(mocks.findByOpenLibraryId).toHaveBeenCalledWith("OLA1");
    expect(mocks.createAuthor).toHaveBeenCalledWith({
      openlibrary_id: "OLA1",
      name: "Frank Herbert",
    });
    expect(mocks.associateAuthorWithBook).toHaveBeenCalledWith(7, 12);
    expect(client.query).toHaveBeenNthCalledWith(2, "COMMIT");
    expect(client.release).toHaveBeenCalledTimes(1);
    expect(mocks.getBookById).toHaveBeenCalledWith(12);
    expect(result).toEqual(bookWithAuthors);
  });

  it("createBook reuses an existing author and rolls back on failure", async () => {
    // Arrange: the author already exists, and the repository fails while creating the book.
    const client = {
      query: vi.fn(),
      release: vi.fn(),
    };
    const bookPayload = {
      openlibrary_id: "OL9999M",
      title: "Bad Book",
      description: "Fails on insert",
      cover_url: "https://example.com/bad.jpg",
      published_date: "2025-01-01",
      authors: [{ openlibrary_id: "OLA99", name: "Existing Author" }],
    };
    const error = new Error("Insert failed");

    mocks.connect.mockResolvedValue(client);
    mocks.findByOpenLibraryId.mockResolvedValue({
      author_id: 23,
      openlibrary_id: "OLA99",
      name: "Existing Author",
    });
    mocks.createBook.mockRejectedValue(error);

    const result = await bookService.createBook(bookPayload);

    expect(client.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(client.query).toHaveBeenNthCalledWith(2, "ROLLBACK");
    expect(mocks.associateAuthorWithBook).not.toHaveBeenCalled();
    expect(mocks.handleServiceError).toHaveBeenCalledWith(
      error,
      "Failed to create book.",
    );
    expect(result).toEqual({
      success: false,
      message: "Failed to create book.",
      error: "Insert failed",
    });
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it("putBook, patchBook, and deleteBook delegate through the repository", async () => {
    // Arrange: each repository method resolves with a value.
    const updatedBook = { book_id: 7, title: "Updated title" };
    const bookWithAuthors = { book_id: 7, title: "Updated title", authors: [] };
    const patchedBook = { book_id: 9, title: "Patched title" };
    const patchedWithAuthors = {
      book_id: 9,
      title: "Patched title",
      authors: [],
    };
    const deletedBook = { book_id: 11, title: "Deleted title" };

    mocks.putBook.mockResolvedValue(updatedBook);
    mocks.getBookById
      .mockResolvedValueOnce(bookWithAuthors)
      .mockResolvedValueOnce(patchedWithAuthors);
    mocks.patchBook.mockResolvedValue(patchedBook);
    mocks.deleteBook.mockResolvedValue(deletedBook);

    // Act/Assert: service methods should wrap repository calls and fetch authors.
    await expect(
      bookService.putBook(7, { title: "Updated title" }),
    ).resolves.toEqual(bookWithAuthors);
    await expect(
      bookService.patchBook(9, { title: "Patched title" }),
    ).resolves.toEqual(patchedWithAuthors);
    await expect(bookService.deleteBook(11)).resolves.toEqual(deletedBook);
    expect(mocks.putBook).toHaveBeenCalledWith(7, { title: "Updated title" });
    expect(mocks.getBookById).toHaveBeenCalledWith(7);
    expect(mocks.patchBook).toHaveBeenCalledWith(9, { title: "Patched title" });
    expect(mocks.getBookById).toHaveBeenCalledWith(9);
    expect(mocks.deleteBook).toHaveBeenCalledWith(11);

    // Arrange: error normalization keeps the service contract consistent.
    const error = new Error("Update failed");
    mocks.putBook.mockRejectedValueOnce(error);

    await expect(
      bookService.putBook(7, { title: "Updated title" }),
    ).resolves.toEqual({
      success: false,
      message: "Failed to update book with id 7.",
      error: "Update failed",
    });
  });
});
