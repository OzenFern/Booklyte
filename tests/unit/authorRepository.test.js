/**
 * Unit tests for the author repository.
 *
 * These tests verify that the repository builds the correct SQL statements and
 * returns the rows expected by the service layer.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../src/db/pool.js";
import {
  associateAuthorWithBook,
  createAuthor,
  findByOpenLibraryId,
  getAllAuthors,
  getAuthorById,
  getAuthorsByBookId,
  updateAuthor,
} from "../../src/repositories/authorRepository.js";

vi.mock("../../src/db/pool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

describe("authorRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findByOpenLibraryId looks up the author by Open Library ID", async () => {
    // Arrange: the authors table contains the matching row.
    const author = {
      author_id: 3,
      openlibrary_id: "OL1234A",
      name: "Mary Shelley",
    };
    pool.query.mockResolvedValue({ rows: [author] });

    await expect(findByOpenLibraryId("OL1234A")).resolves.toEqual(author);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM authors WHERE openlibrary_id = $1",
      ["OL1234A"],
    );
  });

  it("createAuthor inserts a new author and returns the inserted row", async () => {
    // Arrange: a new author payload is sent to the insert query.
    const authorInput = { openlibrary_id: "OL9999A", name: "Shakespeare" };
    const createdAuthor = { author_id: 11, ...authorInput };
    pool.query.mockResolvedValue({ rows: [createdAuthor] });

    await expect(createAuthor(authorInput)).resolves.toEqual(createdAuthor);
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO authors (openlibrary_id, name) VALUES ($1, $2) RETURNING *",
      ["OL9999A", "Shakespeare"],
    );
  });

  it("getAuthorsByBookId returns every author connected to a book", async () => {
    // Arrange: two authors are associated with the selected book.
    const authors = [
      {
        author_id: 1,
        openlibrary_id: "OL1",
        name: "Author One",
        created_at: "2025-01-01",
      },
      {
        author_id: 2,
        openlibrary_id: "OL2",
        name: "Author Two",
        created_at: "2025-01-02",
      },
    ];
    pool.query.mockResolvedValue({ rows: authors });

    await expect(getAuthorsByBookId(5)).resolves.toEqual(authors);
    expect(pool.query).toHaveBeenCalledWith(
      `
        SELECT a.author_id, a.openlibrary_id, a.name, a.created_at
        FROM authors a
        INNER JOIN book_authors ba ON a.author_id = ba.author_id
        WHERE ba.book_id = $1
    `,
      [5],
    );
  });

  it("getAuthorById fetches a single author by ID", async () => {
    // Arrange: the selected author exists in the database.
    const author = {
      author_id: 8,
      openlibrary_id: "OL8",
      name: "Isaac Asimov",
    };
    pool.query.mockResolvedValue({ rows: [author] });

    await expect(getAuthorById(8)).resolves.toEqual(author);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM authors WHERE author_id = $1",
      [8],
    );
  });

  it("updateAuthor patches the provided fields and returns the updated row", async () => {
    // Arrange: partial author data is passed into the update query.
    const authorInput = { name: "George Orwell", openlibrary_id: "OL77" };
    const updatedAuthor = { author_id: 7, ...authorInput };
    pool.query.mockResolvedValue({ rows: [updatedAuthor] });

    await expect(updateAuthor(7, authorInput)).resolves.toEqual(updatedAuthor);
    expect(pool.query).toHaveBeenCalledWith(
      "UPDATE authors SET name = $1, openlibrary_id = $2 WHERE author_id = $3 RETURNING *",
      ["George Orwell", "OL77", 7],
    );
  });

  it("associateAuthorWithBook inserts the relationship row for a book-author join", async () => {
    // Arrange: the join row should be inserted with the book ID and author ID.
    pool.query.mockResolvedValue({ rows: [] });

    await expect(associateAuthorWithBook(10, 20)).resolves.toBeUndefined();
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)",
      [20, 10],
    );
  });

  it("getAllAuthors fetches the full author list", async () => {
    // Arrange: all authors are returned from the authors table.
    const authors = [{ author_id: 1, name: "Aldous Huxley" }];
    pool.query.mockResolvedValue({ rows: authors });

    await expect(getAllAuthors()).resolves.toEqual(authors);
    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM authors");
  });
});
