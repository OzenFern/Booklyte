/**
 * Centralized route handler for all page related routes in the application.
 * @module page
 */
import express from "express";
import * as pc from "../controllers/pageController.js";

const router = express.Router();

router.get("/", pc.getHomePage);
