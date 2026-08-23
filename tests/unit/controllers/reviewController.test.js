/**
 * Unit tests for the review controller.
 *
 * The controller is validated by checking the response handling and redirect
 * behavior for each route without talking to the database.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as reviewController from "../../../src/controllers/reviewController.js";

const mocks = vi.hoisted(() => ({
  getReviewByLibraryBookId: vi.fn(),
  createReview: vi.fn(),
  updateReview: vi.fn(),
  deleteReview: vi.fn(),
  handleControllerError: vi.fn(),
}));

// Reference the functions from the hoisted mocks object to allow assertions on their calls.
vi.mock("../../../src/services/reviewService.js", () => ({
  getReviewByLibraryBookId: mocks.getReviewByLibraryBookId,
  createReview: mocks.createReview,
  updateReview: mocks.updateReview,
  deleteReview: mocks.deleteReview,
}));

vi.mock("../../../src/utils/errorHandler.js", () => ({
  handleControllerError: mocks.handleControllerError,
}));

describe("reviewController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getReviewByLibraryBookId renders the review page when the review exists", async () => {
    // Arrange: the service finds a valid review for the supplied library book ID.
    const req = { params: { id: "5" }, get: vi.fn().mockReturnValue(undefined) };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const review = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(review);

    await reviewController.getReviewByLibraryBookId(req, res, next);

    expect(res.render).toHaveBeenCalledWith("reviews/show", {
      title: "Review",
      review,
      libraryBookId: "5",
    });
  });

  it("getReviewByLibraryBookId redirects to library book page when service returns error", async () => {
    // Arrange: the service returns an error object.
    const req = { params: { id: "5" }, flash: vi.fn() };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const errorResult = {
      success: false,
      message: "Failed to fetch review",
      error: "Database error",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(errorResult);

    await reviewController.getReviewByLibraryBookId(req, res, next);

    expect(req.flash).toHaveBeenCalledWith("error", "Failed to fetch review");
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("createReview flashes success and redirects after creating the review", async () => {
    // Arrange: the create call resolves to a saved review object.
    const req = {
      params: { id: "5" },
      body: { rating: 4.5, review_text: "Great book!" },
      flash: vi.fn(),
      get: vi.fn().mockReturnValue(undefined),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const createdReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    mocks.createReview.mockResolvedValue(createdReview);

    await reviewController.createReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Review created successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("createReview redirects to library book page when service returns error", async () => {
    // Arrange: the service returns an error object.
    const req = {
      params: { id: "5" },
      body: { rating: 6, review_text: "Great book!" }, // Invalid rating
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const errorResult = {
      success: false,
      message: "Rating must be a number between 0 and 5.",
      error: "Rating must be a number between 0 and 5.",
    };
    mocks.createReview.mockResolvedValue(errorResult);

    await reviewController.createReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Rating must be a number between 0 and 5.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("updateReview flashes success and redirects after updating the review", async () => {
    // Arrange: the update operation resolves to a saved review object.
    const req = {
      params: { id: "5" },
      body: { rating: 5.0, review_text: "Updated review" },
      flash: vi.fn(),
      get: vi.fn().mockReturnValue(undefined),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const updatedReview = {
      ...existingReview,
      rating: 5.0,
      review_text: "Updated review",
      updated_at: "2024-01-16T14:45:00Z",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(existingReview);
    mocks.updateReview.mockResolvedValue(updatedReview);

    await reviewController.updateReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Review updated successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("updateReview redirects when review not found", async () => {
    // Arrange: the service returns null for the existing review.
    const req = {
      params: { id: "99" },
      body: { rating: 5.0, review_text: "Updated review" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.getReviewByLibraryBookId.mockResolvedValue(null);

    await reviewController.updateReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Review for library book with ID 99 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/99");
  });

  it("updateReview redirects when service returns error for existing review", async () => {
    // Arrange: the service returns an error object when fetching existing review.
    const req = {
      params: { id: "5" },
      body: { rating: 5.0, review_text: "Updated review" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const errorResult = {
      success: false,
      message: "Failed to fetch review",
      error: "Database error",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(errorResult);

    await reviewController.updateReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith("error", "Failed to fetch review");
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("updateReview redirects when service returns error for update", async () => {
    // Arrange: the service returns an error object when updating review.
    const req = {
      params: { id: "5" },
      body: { rating: 6, review_text: "Updated review" }, // Invalid rating
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const errorResult = {
      success: false,
      message: "Rating must be a number between 0 and 5.",
      error: "Rating must be a number between 0 and 5.",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(existingReview);
    mocks.updateReview.mockResolvedValue(errorResult);

    await reviewController.updateReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Rating must be a number between 0 and 5.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("deleteReview flashes success and redirects after deleting the review", async () => {
    // Arrange: the delete service completes successfully.
    const req = {
      params: { id: "5" },
      flash: vi.fn(),
      get: vi.fn().mockReturnValue(undefined),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const deletedReview = { ...existingReview };
    mocks.getReviewByLibraryBookId.mockResolvedValue(existingReview);
    mocks.deleteReview.mockResolvedValue(deletedReview);

    await reviewController.deleteReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "success",
      "Review deleted successfully.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("deleteReview redirects when review not found", async () => {
    // Arrange: the service returns null for the existing review.
    const req = {
      params: { id: "99" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    mocks.getReviewByLibraryBookId.mockResolvedValue(null);

    await reviewController.deleteReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "Review for library book with ID 99 not found.",
    );
    expect(res.redirect).toHaveBeenCalledWith("/library/99");
  });

  it("deleteReview redirects when service returns error for existing review", async () => {
    // Arrange: the service returns an error object when fetching existing review.
    const req = {
      params: { id: "5" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const errorResult = {
      success: false,
      message: "Failed to fetch review",
      error: "Database error",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(errorResult);

    await reviewController.deleteReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith("error", "Failed to fetch review");
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("deleteReview redirects when service returns error for delete", async () => {
    // Arrange: the service returns an error object when deleting review.
    const req = {
      params: { id: "5" },
      flash: vi.fn(),
    };
    const res = { redirect: vi.fn() };
    const next = vi.fn();
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const errorResult = {
      success: false,
      message: "Failed to delete review",
      error: "Database error",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(existingReview);
    mocks.deleteReview.mockResolvedValue(errorResult);

    await reviewController.deleteReview(req, res, next);

    expect(req.flash).toHaveBeenCalledWith("error", "Failed to delete review");
    expect(res.redirect).toHaveBeenCalledWith("/library/5");
  });

  it("controller errors are delegated to the shared error handler", async () => {
    // Arrange: the service rejects so the controller can forward the error.
    const req = { params: { id: "5" }, flash: vi.fn() };
    const res = { render: vi.fn(), redirect: vi.fn() };
    const next = vi.fn();
    const error = new Error("Service exploded");
    mocks.getReviewByLibraryBookId.mockRejectedValue(error);

    await reviewController.getReviewByLibraryBookId(req, res, next);

    expect(mocks.handleControllerError).toHaveBeenCalledWith(
      error,
      req,
      next,
      "Error retrieving review for library book with ID 5.",
    );
  });

  it("getReviewByLibraryBookId renders partial for HTMX requests", async () => {
    // Arrange: the service finds a valid review for the supplied library book ID.
    const req = { params: { id: "5" }, get: vi.fn().mockReturnValue("true") };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const review = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValue(review);

    await reviewController.getReviewByLibraryBookId(req, res, next);

    expect(res.render).toHaveBeenCalledWith("reviews/partials/review-panel", {
      review,
      libraryBookId: "5",
    });
  });

  it("createReview renders partial for HTMX requests", async () => {
    // Arrange: the create call resolves to a saved review object.
    const req = {
      params: { id: "5" },
      body: { rating: 4.5, review_text: "Great book!" },
      get: vi.fn().mockReturnValue("true"),
    };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const createdReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    mocks.createReview.mockResolvedValue(createdReview);

    await reviewController.createReview(req, res, next);

    expect(res.render).toHaveBeenCalledWith("reviews/partials/review-panel", {
      review: createdReview,
      libraryBookId: "5",
    });
  });

  it("updateReview renders partial for HTMX requests", async () => {
    // Arrange: the update operation resolves to a saved review object.
    const req = {
      params: { id: "5" },
      body: { rating: 5.0, review_text: "Updated review" },
      get: vi.fn().mockReturnValue("true"),
    };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const updatedReview = {
      ...existingReview,
      rating: 5.0,
      review_text: "Updated review",
      updated_at: "2024-01-16T14:45:00Z",
    };
    mocks.getReviewByLibraryBookId.mockResolvedValueOnce(existingReview);
    mocks.updateReview.mockResolvedValue(updatedReview);
    mocks.getReviewByLibraryBookId.mockResolvedValueOnce(updatedReview);

    await reviewController.updateReview(req, res, next);

    expect(res.render).toHaveBeenCalledWith("reviews/partials/review-panel", {
      review: updatedReview,
      libraryBookId: "5",
    });
  });

  it("deleteReview renders partial for HTMX requests", async () => {
    // Arrange: the delete service completes successfully.
    const req = {
      params: { id: "5" },
      get: vi.fn().mockReturnValue("true"),
    };
    const res = { render: vi.fn() };
    const next = vi.fn();
    const existingReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    const deletedReview = { ...existingReview };
    mocks.getReviewByLibraryBookId.mockResolvedValue(existingReview);
    mocks.deleteReview.mockResolvedValue(deletedReview);

    await reviewController.deleteReview(req, res, next);

    expect(res.render).toHaveBeenCalledWith("reviews/partials/review-panel", {
      review: null,
      libraryBookId: "5",
    });
  });
});
