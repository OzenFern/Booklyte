/**
 * Controller for handling review-related operations.
 * Interfaces with HTTP requests and responses and uses the reviewService
 * to perform operations on reviews.
 *
 * Reviews are nested under library books with the following routes:
 * GET    /library/books/:id/review
 * POST   /library/books/:id/review
 * PATCH  /library/books/:id/review
 * DELETE /library/books/:id/review
 *
 * @module reviewController
 */

import * as rs from "../services/reviewService.js";
import { handleControllerError } from "../utils/errorHandler.js";

/**
 * Handles the case when a review is not found.
 * @param req - The HTTP request object.
 * @param id - The ID of the library book that was not found.
 * @param res - The HTTP response object.
 * @returns {*} Redirects to the library book page with an error flash message.
 */
function reviewNotFound(req, id, res) {
  req.flash("error", `Review for library book with ID ${id} not found.`);
  return res.redirect(`/library/${id}`);
}

/**
 * Handles service error responses by checking if the service response indicates failure.
 * If so, it flashes an error message and redirects to the library book page.
 * @param id - The ID of the library book associated with the review.
 * @param serviceResponse - The response object returned from the service layer.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns {boolean} - Returns true if error was handled (redirect sent), false otherwise.
 */
function handleServiceErrorResponse(id, serviceResponse, req, res) {
  if (serviceResponse && serviceResponse.success === false) {
    req.flash("error", serviceResponse.message);
    res.redirect(`/library/${id}`);
    return true;
  }
  return false;
}

/**
 * Retrieves a review by its library book ID and renders the review form.
 * GET /library/books/:id/review
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function getReviewByLibraryBookId(req, res, next) {
  const { id } = req.params;

  try {
    const review = await rs.getReviewByLibraryBookId(id);

    if (handleServiceErrorResponse(id, review, req, res)) {
      return;
    }

    if (req.get("HX-Request")) {
      return res.render("reviews/partials/review-panel", {
        review: review ?? null,
        libraryBookId: id,
      });
    }

    res.render("reviews/show", {
      title: "Review",
      review: review ?? null,
      libraryBookId: id,
    });
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error retrieving review for library book with ID ${id}.`,
    );
  }
}

/**
 * Creates a new review for a library book and redirects to the library book page.
 * POST /library/books/:id/review
 * Expects req.body to contain:
 * {
 *   rating: number (0-5),
 *   review_text: string
 * }
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function createReview(req, res, next) {
  const { id } = req.params;

  try {
    const reviewData = {
      library_book_id: parseInt(id),
      rating: req.body.rating,
      review_text: req.body.review_text,
    };

    const createdReview = await rs.createReview(reviewData);

    if (handleServiceErrorResponse(id, createdReview, req, res)) {
      return;
    }

    if (req.get("HX-Request")) {
      return res.render("reviews/partials/review-panel", {
        review: createdReview,
        libraryBookId: id,
      });
    }

    req.flash("success", "Review created successfully.");
    res.redirect(`/library/${id}`);
  } catch (error) {
    handleControllerError(error, req, next, "Error creating review.");
  }
}

/**
 * Updates an existing review for a library book and redirects to the library book page.
 * PATCH /library/books/:id/review
 * Expects req.body to contain:
 * {
 *   rating: number (0-5),
 *   review_text: string
 * }
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function updateReview(req, res, next) {
  const { id } = req.params;

  try {
    // First get the existing review to find its review_id
    const existingReview = await rs.getReviewByLibraryBookId(id);

    if (handleServiceErrorResponse(id, existingReview, req, res)) {
      return;
    }

    if (!existingReview) {
      return reviewNotFound(req, id, res);
    }

    // Update the review using the review_id
    const reviewData = {
      rating: req.body.rating,
      review_text: req.body.review_text,
    };

    const updatedReview = await rs.updateReview(
      existingReview.review_id,
      reviewData,
    );

    // Check if service returned an error object
    if (handleServiceErrorResponse(id, updatedReview, req, res)) {
      return;
    }

    if (req.get("HX-Request")) {
      const review = await rs.getReviewByLibraryBookId(id);
      if (handleServiceErrorResponse(id, review, req, res)) {
        return;
      }
      return res.render("reviews/partials/review-panel", {
        review,
        libraryBookId: id,
      });
    }

    req.flash("success", "Review updated successfully.");
    res.redirect(`/library/${id}`);
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error updating review for library book with ID ${id}.`,
    );
  }
}

/**
 * Deletes a review for a library book and redirects to the library book page.
 * DELETE /library/books/:id/review
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} next - Express middleware function used to pass errors.
 */
export async function deleteReview(req, res, next) {
  const { id } = req.params;

  try {
    // First get the existing review to find its review_id
    const existingReview = await rs.getReviewByLibraryBookId(id);

    if (handleServiceErrorResponse(id, existingReview, req, res)) {
      return;
    }

    if (!existingReview) {
      return reviewNotFound(req, id, res);
    }

    // Delete the review using the review_id
    const deletedReview = await rs.deleteReview(
      existingReview.review_id,
    );

    if (handleServiceErrorResponse(id, deletedReview, req, res)) {
      return;
    }

    if (req.get("HX-Request")) {
      return res.render("reviews/partials/review-panel", {
        review: null,
        libraryBookId: id,
      });
    }

    req.flash("success", "Review deleted successfully.");
    res.redirect(`/library/${id}`);
  } catch (error) {
    handleControllerError(
      error,
      req,
      next,
      `Error deleting review for library book with ID ${id}.`,
    );
  }
}
