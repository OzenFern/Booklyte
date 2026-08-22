/**
 * Unit tests for the review service layer.
 *
 * These tests validate the service's data flow and error handling while
 * allowing repository calls to be mocked.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as reviewService from "../../src/services/reviewService.js";

// Hoist the mocks to ensure they are available before the service module is imported.
const mocks = vi.hoisted(() => ({
  getReviewByLibraryBookId: vi.fn(),
  getReviewById: vi.fn(),
  createReview: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
  handleServiceError: vi.fn((error, message) => ({
    success: false,
    message,
    error: error instanceof Error ? error.message : "Unknown error",
  })),
}));

vi.mock("../../src/repositories/reviewRepository.js", () => ({
  getReviewByLibraryBookId: mocks.getReviewByLibraryBookId,
  getReviewById: mocks.getReviewById,
  createReview: mocks.createReview,
  updateReview: mocks.updateReview,
  deleteReview: mocks.deleteReview,
}));

vi.mock("../../src/utils/errorHandler.js", () => ({
  handleServiceError: mocks.handleServiceError,
}));

describe("reviewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getReviewByLibraryBookId returns the found review or forwards the repository error", async () => {
    // Arrange: the repository resolves a matching review.
    const review = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(review);

    await expect(reviewService.getReviewByLibraryBookId(5)).resolves.toEqual(
      review,
    );
    expect(mocks.getReviewByLibraryBookId).toHaveBeenCalledWith(5);

    // Arrange: a repository failure should be normalized to a service error payload.
    const error = new Error("Lookup failed");
    mocks.getReviewByLibraryBookId.mockRejectedValueOnce(error);

    await expect(reviewService.getReviewByLibraryBookId(99)).resolves.toEqual({
      success: false,
      message: "Failed to fetch review for library book with id 99.",
      error: "Lookup failed",
    });
  });

  it("getReviewByLibraryBookId validates library book ID", async () => {
    // Arrange: invalid library book ID
    const error = new Error("Invalid library book ID.");
    mocks.getReviewByLibraryBookId.mockRejectedValue(error);

    await expect(reviewService.getReviewByLibraryBookId(null)).resolves.toEqual(
      {
        success: false,
        message: "Library book ID must be a valid number.",
        error: "Invalid library book ID.",
      },
    );
  });

  it("createReview creates a new review with validation", async () => {
    // Arrange: the repository resolves with the created review.
    const reviewData = {
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
    };
    const createdReview = {
      review_id: 1,
      ...reviewData,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(null);
    mocks.createReview.mockResolvedValue(createdReview);

    await expect(reviewService.createReview(reviewData)).resolves.toEqual(
      createdReview,
    );
    expect(mocks.getReviewByLibraryBookId).toHaveBeenCalledWith(5);
    expect(mocks.createReview).toHaveBeenCalledWith(reviewData);
  });

  it("createReview validates rating range", async () => {
    // Arrange: invalid rating value
    const reviewData = {
      library_book_id: 5,
      rating: 6, // Invalid: must be 0-5
      review_text: "Great book!",
    };

    const result = await reviewService.createReview(reviewData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Rating must be a number between 0 and 5");
    expect(mocks.createReview).not.toHaveBeenCalled();
  });

  it("createReview prevents duplicate reviews", async () => {
    // Arrange: a review already exists for this library book
    const reviewData = {
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
    };
    const existingReview = {
      review_id: 1,
      ...reviewData,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(existingReview);

    const result = await reviewService.createReview(reviewData);

    expect(result).toEqual({
      success: false,
      message:
        "A review already exists for this library book. Use update instead.",
      error: "Review already exists for this library book.",
    });
    expect(mocks.createReview).not.toHaveBeenCalled();
  });

  it("createReview handles foreign key constraint violations", async () => {
    // Arrange: foreign key violation error
    const reviewData = {
      library_book_id: 999,
      rating: 4.5,
      review_text: "Great book!",
    };
    const error = new Error("Foreign key violation");
    error.code = "23503";
    mocks.getReviewByLibraryBookId.mockResolvedValue(null);
    mocks.createReview.mockRejectedValue(error);

    const result = await reviewService.createReview(reviewData);

    expect(result).toEqual({
      success: false,
      message:
        "Library book does not exist. Cannot create review for non-existent library book.",
      error: "Foreign key violation",
    });
  });

  it("updateReview updates an existing review with validation", async () => {
    // Arrange: the repository resolves with the updated review.
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.0,
      review_text: "Good book",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const updates = { rating: 4.5, review_text: "Great book!" };
    const updatedReview = {
      ...existingReview,
      ...updates,
      updated_at: "2024-01-16T14:45:00Z",
    };
    mocks.getReviewById.mockResolvedValue(existingReview);
    mocks.updateReview.mockResolvedValue(updatedReview);

    const result = await reviewService.updateReview(1, updates);
    expect(result).toEqual(updatedReview);
    expect(mocks.getReviewById).toHaveBeenCalledWith(1);
    expect(mocks.updateReview).toHaveBeenCalledWith(1, updates);
  });

  it("updateReview validates review ID", async () => {
    // Arrange: invalid review ID
    const error = new Error("Invalid review ID.");
    mocks.getReviewById.mockRejectedValue(error);

    await expect(
      reviewService.updateReview(null, { rating: 4.5 }),
    ).resolves.toEqual({
      success: false,
      message: "Review ID must be a valid number.",
      error: "Invalid review ID.",
    });
  });

  it("updateReview returns error when review not found", async () => {
    // Arrange: review does not exist
    mocks.getReviewById.mockResolvedValue(null);

    const result = await reviewService.updateReview(99, {
      rating: 4.5,
      review_text: "Updated text",
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("Review with id 99 does not exist");
    expect(mocks.updateReview).not.toHaveBeenCalled();
  });

  it("updateReview validates rating on update", async () => {
    // Arrange: invalid rating value in update
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.0,
      review_text: "Good book",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const updates = { rating: 6 }; // Invalid
    mocks.getReviewById.mockResolvedValue(existingReview);

    const result = await reviewService.updateReview(1, updates);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Rating must be a number between 0 and 5");
    expect(mocks.updateReview).not.toHaveBeenCalled();
  });

  it("deleteReview deletes an existing review", async () => {
    // Arrange: the repository resolves with the deleted review.
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const deletedReview = { ...existingReview };
    mocks.getReviewById.mockResolvedValue(existingReview);
    mocks.deleteReview.mockResolvedValue(deletedReview);

    await expect(reviewService.deleteReview(1)).resolves.toEqual(deletedReview);
    expect(mocks.getReviewById).toHaveBeenCalledWith(1);
    expect(mocks.deleteReview).toHaveBeenCalledWith(1);
  });

  it("deleteReview validates review ID", async () => {
    // Arrange: invalid review ID
    const error = new Error("Invalid review ID.");
    mocks.getReviewById.mockRejectedValue(error);

    await expect(reviewService.deleteReview(null)).resolves.toEqual({
      success: false,
      message: "Review ID must be a valid number.",
      error: "Invalid review ID.",
    });
  });

  it("deleteReview returns error when review not found", async () => {
    // Arrange: review does not exist
    mocks.getReviewById.mockResolvedValue(null);

    const result = await reviewService.deleteReview(99);

    expect(result).toEqual({
      success: false,
      message: "Review with id 99 does not exist.",
      error: "Review not found.",
    });
    expect(mocks.deleteReview).not.toHaveBeenCalled();
  });
});
