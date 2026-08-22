/**
 * Unit tests for the book repository.
 *
 * These tests exercise the repository methods directly by mocking the shared
 * PostgreSQL pool and asserting the generated SQL and payloads.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../src/db/pool.js";
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  patchBook,
  putBook,
} from "../../src/repositories/bookRepository.js";

vi.mock("../../src/db/pool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

describe("bookRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllBooks fetches every book from the database with authors", async () => {
    // Arrange: simulate the database returning all rows with authors as JSON.
    const books = [
      {
        book_id: 1,
        title: "Dune",
        authors:
          '[{"author_id": 1, "name": "Frank Herbert", "openlibrary_id": "OL1"}]',
      },
      {
        book_id: 2,
        title: "Foundation",
        authors:
          '[{"author_id": 2, "name": "Isaac Asimov", "openlibrary_id": "OL2"}]',
      },
    ];
    pool.query.mockResolvedValue({ rows: books });

    // Act/Assert: the repository should pass the expected SELECT query with LEFT JOIN.
    await expect(getAllBooks()).resolves.toEqual(books);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("SELECT");
    expect(queryCall).toContain("b.book_id");
    expect(queryCall).toContain("LEFT JOIN book_authors");
    expect(queryCall).toContain("LEFT JOIN authors");
    expect(queryCall).toContain("JSON_AGG");
    expect(queryCall).toContain("JSON_BUILD_OBJECT");
    expect(queryCall).toContain("GROUP BY");
  });

  it("getBookById returns the book with its authors when found", async () => {
    // Arrange: the book exists with authors as JSON from the LEFT JOIN query.
    const expectedBook = {
      book_id: 42,
      title: "The Hobbit",
      authors:
        '[{"author_id": 7, "name": "J.R.R. Tolkien", "openlibrary_id": "OL7"}]',
    };
    pool.query.mockResolvedValue({ rows: [expectedBook] });

    await expect(getBookById(42)).resolves.toEqual(expectedBook);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("SELECT");
    expect(queryCall).toContain("b.book_id");
    expect(queryCall).toContain("LEFT JOIN book_authors");
    expect(queryCall).toContain("LEFT JOIN authors");
    expect(queryCall).toContain("WHERE b.book_id = $1");
    expect(queryCall).toContain("JSON_AGG");
    expect(queryCall).toContain("JSON_BUILD_OBJECT");
    expect(queryCall).toContain("GROUP BY");
    expect(pool.query.mock.calls[0][1]).toEqual([42]);
  });

  it("getBookById returns null when the book does not exist", async () => {
    // Arrange: no rows are returned for the lookup, so the repository should return null.
    pool.query.mockResolvedValue({ rows: [] });

    await expect(getBookById(99)).resolves.toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("WHERE b.book_id = $1");
    expect(pool.query.mock.calls[0][1]).toEqual([99]);
  });

  it("createBook inserts a new record and returns it", async () => {
    // Arrange: provide a new book payload matching the repository contract.
    const bookInput = {
      openlibrary_id: "OL12345M",
      title: "Pride and Prejudice",
      description: "A witty romance",
      cover_url: "https://example.com/cover.jpg",
      published_date: "1813-01-28",
    };
    const createdBook = { book_id: 8, ...bookInput };
    pool.query.mockResolvedValue({ rows: [createdBook] });

    await expect(createBook(bookInput)).resolves.toEqual(createdBook);
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO books (openlibrary_id, title,description,cover_url, published_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        "OL12345M",
        "Pride and Prejudice",
        "A witty romance",
        "https://example.com/cover.jpg",
        "1813-01-28",
      ],
    );
  });

  it("putBook fully updates the selected book and returns the updated row", async () => {
    // Arrange: a complete replacement payload is supplied for the update.
    const bookInput = {
      openlibrary_id: "OL54321M",
      title: "Jane Eyre",
      description: "A Gothic novel",
      cover_url: "https://example.com/jane.jpg",
      published_date: "1847-10-16",
    };
    const updatedBook = { book_id: 5, ...bookInput };
    pool.query.mockResolvedValue({ rows: [updatedBook] });

    await expect(putBook(5, bookInput)).resolves.toEqual(updatedBook);
    expect(pool.query).toHaveBeenCalledWith(
      "UPDATE books SET openlibrary_id = $1, title = $2, description = $3, cover_url = $4, published_date = $5, updated_at = CURRENT_TIMESTAMP WHERE book_id = $6 RETURNING *",
      [
        "OL54321M",
        "Jane Eyre",
        "A Gothic novel",
        "https://example.com/jane.jpg",
        "1847-10-16",
        5,
      ],
    );
  });

  it("patchBook updates only the supplied fields and returns the changed record", async () => {
    // Arrange: only title and published_date are passed in the patch object.
    const bookInput = {
      title: "The Left Hand of Darkness",
      published_date: "1969-01-01",
    };
    const patchedBook = {
      book_id: 12,
      title: "The Left Hand of Darkness",
      published_date: "1969-01-01",
    };
    pool.query.mockResolvedValue({ rows: [patchedBook] });

    await expect(patchBook(12, bookInput)).resolves.toEqual(patchedBook);
    expect(pool.query).toHaveBeenCalledWith(
      "UPDATE books SET title = $1, published_date = $2, updated_at = CURRENT_TIMESTAMP WHERE book_id = $3 RETURNING *",
      ["The Left Hand of Darkness", "1969-01-01", 12],
    );
  });

  it("deleteBook removes a book and returns the deleted row", async () => {
    // Arrange: mock the delete-returning row for the selected book ID.
    const deletedBook = { book_id: 3, title: "The Silent Patient" };
    pool.query.mockResolvedValue({ rows: [deletedBook] });

    await expect(deleteBook(3)).resolves.toEqual(deletedBook);
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM books WHERE book_id = $1 RETURNING *",
      [3],
    );
  });
});
