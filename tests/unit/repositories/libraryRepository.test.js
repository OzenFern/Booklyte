/**
 * Unit tests for the library repository.
 *
 * These tests verify that the repository builds the correct SQL statements and
 * returns the rows expected by the service layer.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../../src/db/pool.js";
import {
  addBookToLibrary,
  getLibraryBookById,
  getLibraryBooks,
  removeBookFromLibrary,
  putLibraryBook,
  patchLibraryBook,
} from "../../../src/repositories/libraryRepository.js";

vi.mock("../../../src/db/pool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

describe("libraryRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getLibraryBooks fetches every library book from the database with authors", async () => {
    // Arrange: simulate the database returning all rows with authors as JSON.
    const libraryBooks = [
      {
        library_book_id: 1,
        book_id: 42,
        title: "Dune",
        status: "reading",
        authors: '[{"author_id": 1, "name": "Frank Herbert"}]',
      },
      {
        library_book_id: 2,
        book_id: 43,
        title: "Foundation",
        status: "completed",
        authors: '[{"author_id": 2, "name": "Isaac Asimov"}]',
      },
    ];
    pool.query.mockResolvedValue({ rows: libraryBooks });

    // Act/Assert: the repository should pass the expected SELECT query with JOINs.
    await expect(getLibraryBooks()).resolves.toEqual(libraryBooks);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("SELECT");
    expect(queryCall).toContain("lb.library_book_id");
    expect(queryCall).toContain("JOIN books");
    expect(queryCall).toContain("LEFT JOIN book_authors");
    expect(queryCall).toContain("LEFT JOIN authors");
    expect(queryCall).toContain("JSON_AGG");
    expect(queryCall).toContain("JSON_BUILD_OBJECT");
    expect(queryCall).toContain("GROUP BY");
    expect(queryCall).toContain("b.title ILIKE $1");
    expect(queryCall).toContain("search_author.name ILIKE $1");
    expect(pool.query.mock.calls[0][1]).toEqual(["%%"]);
  });

  it("getLibraryBookById returns the library book with its authors when found", async () => {
    // Arrange: the library book exists with authors as JSON from the JOIN query.
    const expectedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      title: "The Hobbit",
      status: "completed",
      authors: '[{"author_id": 7, "name": "J.R.R. Tolkien"}]',
    };
    pool.query.mockResolvedValue({ rows: [expectedLibraryBook] });

    await expect(getLibraryBookById(1)).resolves.toEqual(expectedLibraryBook);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("SELECT");
    expect(queryCall).toContain("lb.library_book_id");
    expect(queryCall).toContain("JOIN books");
    expect(queryCall).toContain("LEFT JOIN book_authors");
    expect(queryCall).toContain("LEFT JOIN authors");
    expect(queryCall).toContain("WHERE lb.library_book_id = $1");
    expect(queryCall).toContain("JSON_AGG");
    expect(queryCall).toContain("JSON_BUILD_OBJECT");
    expect(queryCall).toContain("GROUP BY");
    expect(pool.query.mock.calls[0][1]).toEqual([1]);
  });

  it("getLibraryBookById returns null when the library book does not exist", async () => {
    // Arrange: no rows are returned for the lookup, so the repository should return null.
    pool.query.mockResolvedValue({ rows: [] });

    await expect(getLibraryBookById(99)).resolves.toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("WHERE lb.library_book_id = $1");
    expect(pool.query.mock.calls[0][1]).toEqual([99]);
  });

  it("addBookToLibrary inserts a new library book and returns it", async () => {
    // Arrange: provide a library book payload matching the repository contract.
    const bookId = 42;
    const status = "want_to_read";
    const createdLibraryBook = {
      library_book_id: 5,
      book_id: 42,
      status: "want_to_read",
    };
    pool.query.mockResolvedValue({ rows: [createdLibraryBook] });

    await expect(addBookToLibrary(bookId, status)).resolves.toEqual(
      createdLibraryBook,
    );
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO library_books (book_id, status) VALUES ($1, $2) RETURNING *",
      [42, "want_to_read"],
    );
  });

  it("putLibraryBook completely updates the library book and returns the updated row", async () => {
    // Arrange: provide a complete update payload for the library book.
    const updates = { book_id: 42, status: "completed" };
    const updatedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "completed",
    };
    pool.query.mockResolvedValue({ rows: [updatedLibraryBook] });

    await expect(putLibraryBook(1, updates)).resolves.toEqual(
      updatedLibraryBook,
    );

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("UPDATE library_books");
    expect(queryCall).toContain("SET book_id = $1, status = $2");
    expect(queryCall).toContain("WHERE library_book_id = $3");
    expect(queryCall).toContain("RETURNING *");
    expect(pool.query.mock.calls[0][1]).toEqual([42, "completed", 1]);
  });

  it("patchLibraryBook partially updates the library book and returns the updated row", async () => {
    // Arrange: provide a partial update payload for the library book.
    const updates = { status: "completed" };
    const updatedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "completed",
    };
    pool.query.mockResolvedValue({ rows: [updatedLibraryBook] });

    await expect(patchLibraryBook(1, updates)).resolves.toEqual(
      updatedLibraryBook,
    );

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("UPDATE library_books");
    expect(queryCall).toContain("SET");
    expect(queryCall).toContain("status = $1");
    expect(queryCall).toContain("WHERE library_book_id = $2");
    expect(queryCall).toContain("RETURNING *");
    expect(pool.query.mock.calls[0][1]).toEqual(["completed", 1]);
  });

  it("patchLibraryBook handles multiple fields", async () => {
    // Arrange: provide multiple fields to update.
    const updates = { status: "reading" };
    const updatedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "reading",
    };
    pool.query.mockResolvedValue({ rows: [updatedLibraryBook] });

    await expect(patchLibraryBook(1, updates)).resolves.toEqual(
      updatedLibraryBook,
    );

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("UPDATE library_books");
    expect(queryCall).toContain("SET");
    expect(queryCall).toContain("status = $1");
    expect(queryCall).toContain("WHERE library_book_id = $2");
    expect(pool.query.mock.calls[0][1]).toEqual(["reading", 1]);
  });

  it("removeBookFromLibrary removes a library book and returns the deleted row", async () => {
    // Arrange: mock the delete operation to return the deleted book.
    const deletedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "completed",
    };
    pool.query.mockResolvedValue({ rows: [deletedLibraryBook] });

    await expect(removeBookFromLibrary(1)).resolves.toEqual(deletedLibraryBook);
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM library_books WHERE library_book_id = $1 RETURNING *",
      [1],
    );
  });
});
