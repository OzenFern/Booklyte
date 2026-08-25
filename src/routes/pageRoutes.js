/**
 * Centralized route handler for all page related routes in the application.
 * @module page
 */
import express from "express";
import * as pc from "../controllers/pageController.js";

const router = express.Router();

/**
 * GET /
 * Render the home page of the application.
 */
router.get("/", pc.getHomePage);

export default router;
