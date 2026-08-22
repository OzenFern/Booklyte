/**
 * Unit tests for the review repository.
 *
 * These tests exercise the repository methods directly by mocking the shared
 * PostgreSQL pool and asserting the generated SQL and payloads.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import pool from "../../../src/db/pool.js";
import {
  createReview,
  deleteReview,
  getReviewById,
  getReviewByLibraryBookId,
  updateReview,
} from "../../../src/repositories/reviewRepository.js";

vi.mock("../../../src/db/pool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

describe("reviewRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getReviewByLibraryBookId returns the review when found", async () => {
    // Arrange: the review exists for the given library book ID
    const expectedReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    pool.query.mockResolvedValue({ rows: [expectedReview] });

    await expect(getReviewByLibraryBookId(5)).resolves.toEqual(expectedReview);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("SELECT");
    expect(queryCall).toContain("FROM reviews");
    expect(queryCall).toContain("WHERE library_book_id = $1");
    expect(pool.query.mock.calls[0][1]).toEqual([5]);
  });

  it("getReviewByLibraryBookId returns null when review does not exist", async () => {
    // Arrange: no rows are returned for the lookup
    pool.query.mockResolvedValue({ rows: [] });

    await expect(getReviewByLibraryBookId(99)).resolves.toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("WHERE library_book_id = $1");
    expect(pool.query.mock.calls[0][1]).toEqual([99]);
  });

  it("getReviewById returns the review when found", async () => {
    // Arrange: the review exists for the given review ID
    const expectedReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    pool.query.mockResolvedValue({ rows: [expectedReview] });

    await expect(getReviewById(1)).resolves.toEqual(expectedReview);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("SELECT");
    expect(queryCall).toContain("FROM reviews");
    expect(queryCall).toContain("WHERE review_id = $1");
    expect(pool.query.mock.calls[0][1]).toEqual([1]);
  });

  it("getReviewById returns null when review does not exist", async () => {
    // Arrange: no rows are returned for the lookup
    pool.query.mockResolvedValue({ rows: [] });

    await expect(getReviewById(99)).resolves.toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("WHERE review_id = $1");
    expect(pool.query.mock.calls[0][1]).toEqual([99]);
  });

  it("createReview inserts a new review and returns it", async () => {
    // Arrange: provide a new review payload matching the repository contract
    const reviewInput = {
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
    };
    const createdReview = {
      review_id: 1,
      ...reviewInput,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    pool.query.mockResolvedValue({ rows: [createdReview] });

    await expect(createReview(reviewInput)).resolves.toEqual(createdReview);
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO reviews (library_book_id, rating, review_text) VALUES ($1, $2, $3) RETURNING *",
      [5, 4.5, "Great book!"],
    );
  });

  it("updateReview updates the review and returns the updated row with updated_at", async () => {
    // Arrange: provide an update payload for the review
    const reviewInput = {
      rating: 5.0,
      review_text: "Updated review - amazing book!",
    };
    const updatedReview = {
      review_id: 1,
      library_book_id: 5,
      ...reviewInput,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-16T14:45:00Z",
    };
    pool.query.mockResolvedValue({ rows: [updatedReview] });

    await expect(updateReview(1, reviewInput)).resolves.toEqual(updatedReview);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("UPDATE reviews");
    expect(queryCall).toContain("SET");
    expect(queryCall).toContain("rating = $1");
    expect(queryCall).toContain("review_text = $2");
    expect(queryCall).toContain("updated_at = CURRENT_TIMESTAMP");
    expect(queryCall).toContain("WHERE review_id = $3");
    expect(queryCall).toContain("RETURNING *");
    expect(pool.query.mock.calls[0][1]).toEqual([
      5.0,
      "Updated review - amazing book!",
      1,
    ]);
  });

  it("updateReview updates only rating field", async () => {
    // Arrange: only rating is passed in the update object
    const reviewInput = { rating: 3.5 };
    const updatedReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 3.5,
      review_text: "Original review text",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-16T14:45:00Z",
    };
    pool.query.mockResolvedValue({ rows: [updatedReview] });

    await expect(updateReview(1, reviewInput)).resolves.toEqual(updatedReview);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("UPDATE reviews");
    expect(queryCall).toContain("SET");
    expect(queryCall).toContain("rating = $1");
    expect(queryCall).toContain("updated_at = CURRENT_TIMESTAMP");
    expect(queryCall).toContain("WHERE review_id = $2");
    expect(pool.query.mock.calls[0][1]).toEqual([3.5, 1]);
  });

  it("updateReview updates only review_text field", async () => {
    // Arrange: only review_text is passed in the update object
    const reviewInput = { review_text: "Updated text only" };
    const updatedReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Updated text only",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-16T14:45:00Z",
    };
    pool.query.mockResolvedValue({ rows: [updatedReview] });

    await expect(updateReview(1, reviewInput)).resolves.toEqual(updatedReview);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("UPDATE reviews");
    expect(queryCall).toContain("SET");
    expect(queryCall).toContain("review_text = $1");
    expect(queryCall).toContain("updated_at = CURRENT_TIMESTAMP");
    expect(queryCall).toContain("WHERE review_id = $2");
    expect(pool.query.mock.calls[0][1]).toEqual(["Updated text only", 1]);
  });

  it("updateReview returns null when review does not exist", async () => {
    // Arrange: no rows are returned for the update
    pool.query.mockResolvedValue({ rows: [] });

    const reviewInput = { rating: 5.0 };
    await expect(updateReview(99, reviewInput)).resolves.toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("deleteReview removes a review and returns the deleted row", async () => {
    // Arrange: mock the delete-returning row for the selected review ID
    const deletedReview = {
      review_id: 1,
      library_book_id: 5,
      rating: 4.5,
      review_text: "Great book!",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    };
    pool.query.mockResolvedValue({ rows: [deletedReview] });

    await expect(deleteReview(1)).resolves.toEqual(deletedReview);
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM reviews WHERE review_id = $1 RETURNING *",
      [1],
    );
  });

  it("deleteReview returns null when review does not exist", async () => {
    // Arrange: no rows are returned for the delete
    pool.query.mockResolvedValue({ rows: [] });

    await expect(deleteReview(99)).resolves.toBeNull();
    expect(pool.query).toHaveBeenCalledTimes(1);

    const queryCall = pool.query.mock.calls[0][0];
    expect(queryCall).toContain("DELETE FROM reviews");
    expect(queryCall).toContain("WHERE review_id = $1");
    expect(pool.query.mock.calls[0][1]).toEqual([99]);
  });
});
