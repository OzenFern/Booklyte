/**
 * Routes for review-related operations.
 * Reviews are nested under library books with the following routes:
 * GET    /library/books/:id/review
 * POST   /library/books/:id/review
 * PATCH  /library/books/:id/review
 * DELETE /library/books/:id/review
 *
 * This router should be mounted at /library/books in the main application.
 *
 * @module reviewsRoutes
 */

import express from "express";
import {
  getReviewByLibraryBookId,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

/**
 * GET /:id/review
 * Display the review for a library book.
 */
router.get("/:id/review", getReviewByLibraryBookId);

/**
 * POST /:id/review
 * Create a new review for a library book.
 */
router.post("/:id/review", createReview);

/**
 * PATCH /:id/review
 * Update an existing review for a library book.
 */
router.patch("/:id/review", updateReview);

/**
 * DELETE /:id/review
 * Delete a review for a library book.
 */
router.delete("/:id/review", deleteReview);

export default router;
