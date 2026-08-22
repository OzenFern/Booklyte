/**
 * Unit tests for the library service layer.
 *
 * These tests validate the service's data flow and error handling while
 * allowing repository calls to be mocked.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as libraryService from "../../src/services/libraryService.js";

// Hoist the mocks to ensure they are available before the service module is imported.
const mocks = vi.hoisted(() => ({
  getLibraryBooks: vi.fn(),
  getLibraryBookById: vi.fn(),
  addBookToLibrary: vi.fn(),
  updateLibraryBook: vi.fn(),
  removeBookFromLibrary: vi.fn(),
  handleServiceError: vi.fn((error, message) => ({
    success: false,
    message,
    error: error instanceof Error ? error.message : "Unknown error",
  })),
}));

vi.mock("../../src/repositories/libraryRepository.js", () => ({
  getLibraryBooks: mocks.getLibraryBooks,
  getLibraryBookById: mocks.getLibraryBookById,
  addBookToLibrary: mocks.addBookToLibrary,
  updateLibraryBook: mocks.updateLibraryBook,
  removeBookFromLibrary: mocks.removeBookFromLibrary,
}));

vi.mock("../../src/utils/errorHandler.js", () => ({
  handleServiceError: mocks.handleServiceError,
}));

describe("libraryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllLibraryBooks delegates to the repository and returns its result", async () => {
    // Arrange: the repository resolves with a list of library books.
    const libraryBooks = [
      {
        library_book_id: 1,
        book_id: 42,
        title: "Dune",
        status: "reading",
        authors: [{ author_id: 1, name: "Frank Herbert" }],
      },
    ];
    mocks.getLibraryBooks.mockResolvedValue(libraryBooks);

    // Act/Assert: the service should pass through the repository data.
    await expect(libraryService.getAllLibraryBooks()).resolves.toEqual(
      libraryBooks,
    );
    expect(mocks.getLibraryBooks).toHaveBeenCalledTimes(1);
  });

  it("getAllLibraryBooks handles repository errors", async () => {
    // Arrange: a repository failure should be normalized to a service error payload.
    const error = new Error("Database connection failed");
    mocks.getLibraryBooks.mockRejectedValue(error);

    await expect(libraryService.getAllLibraryBooks()).resolves.toEqual({
      success: false,
      message: "Failed to fetch library books.",
      error: "Database connection failed",
    });
    expect(mocks.handleServiceError).toHaveBeenCalledWith(
      error,
      "Failed to fetch library books.",
    );
  });

  it("getLibraryBookById returns the found library book or forwards the repository error", async () => {
    // Arrange: the repository resolves a matching library book.
    const libraryBook = {
      library_book_id: 1,
      book_id: 42,
      title: "The Hobbit",
      status: "completed",
      authors: [{ author_id: 2, name: "J.R.R. Tolkien" }],
    };
    mocks.getLibraryBookById.mockResolvedValue(libraryBook);

    await expect(libraryService.getLibraryBookById(1)).resolves.toEqual(
      libraryBook,
    );
    expect(mocks.getLibraryBookById).toHaveBeenCalledWith(1);

    // Arrange: a repository failure should be normalized to a service error payload.
    const error = new Error("Lookup failed");
    mocks.getLibraryBookById.mockRejectedValueOnce(error);

    await expect(libraryService.getLibraryBookById(99)).resolves.toEqual({
      success: false,
      message: "Failed to fetch library book with id 99.",
      error: "Lookup failed",
    });
  });

  it("addBookToLibrary delegates to the repository and returns the result", async () => {
    // Arrange: the repository resolves with the created library book.
    const newLibraryBook = {
      library_book_id: 5,
      book_id: 42,
      status: "want_to_read",
    };
    mocks.addBookToLibrary.mockResolvedValue(newLibraryBook);

    // Act/Assert: the service should pass through the repository data.
    await expect(
      libraryService.addBookToLibrary(42, "want_to_read"),
    ).resolves.toEqual(newLibraryBook);
    expect(mocks.addBookToLibrary).toHaveBeenCalledWith(42, "want_to_read");
  });

  it("addBookToLibrary handles repository errors", async () => {
    // Arrange: a repository failure should be normalized to a service error payload.
    const error = new Error("Duplicate book in library");
    mocks.addBookToLibrary.mockRejectedValue(error);

    await expect(
      libraryService.addBookToLibrary(42, "reading"),
    ).resolves.toEqual({
      success: false,
      message: "Failed to add book to library.",
      error: "Duplicate book in library",
    });
    expect(mocks.handleServiceError).toHaveBeenCalledWith(
      error,
      "Failed to add book to library.",
    );
  });

  it("updateLibraryBook delegates to the repository and returns the result", async () => {
    // Arrange: the repository resolves with the updated library book.
    const updatedLibraryBook = {
      library_book_id: 1,
      book_id: 42,
      status: "completed",
    };
    const updates = { status: "completed" };
    mocks.updateLibraryBook.mockResolvedValue(updatedLibraryBook);

    // Act/Assert: the service should pass through the repository data.
    await expect(libraryService.updateLibraryBook(1, updates)).resolves.toEqual(
      updatedLibraryBook,
    );
    expect(mocks.updateLibraryBook).toHaveBeenCalledWith(1, updates);
  });

  it("updateLibraryBook handles repository errors", async () => {
    // Arrange: a repository failure should be normalized to a service error payload.
    const error = new Error("Update failed");
    mocks.updateLibraryBook.mockRejectedValue(error);

    await expect(
      libraryService.updateLibraryBook(1, { status: "reading" }),
    ).resolves.toEqual({
      success: false,
      message: "Failed to update library book with id 1.",
      error: "Update failed",
    });
    expect(mocks.handleServiceError).toHaveBeenCalledWith(
      error,
      "Failed to update library book with id 1.",
    );
  });

  it("removeBookFromLibrary delegates to the repository and returns the result", async () => {
    // Arrange: the repository resolves successfully.
    mocks.removeBookFromLibrary.mockResolvedValue(undefined);

    // Act/Assert: the service should pass through the repository call.
    await expect(
      libraryService.removeBookFromLibrary(1),
    ).resolves.toBeUndefined();
    expect(mocks.removeBookFromLibrary).toHaveBeenCalledWith(1);
  });

  it("removeBookFromLibrary handles repository errors", async () => {
    // Arrange: a repository failure should be normalized to a service error payload.
    const error = new Error("Delete failed");
    mocks.removeBookFromLibrary.mockRejectedValue(error);

    await expect(libraryService.removeBookFromLibrary(1)).resolves.toEqual({
      success: false,
      message: "Failed to remove library book with id 1.",
      error: "Delete failed",
    });
    expect(mocks.handleServiceError).toHaveBeenCalledWith(
      error,
      "Failed to remove library book with id 1.",
    );
  });
});
