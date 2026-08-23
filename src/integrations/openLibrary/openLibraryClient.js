/**
 * Open Library API Client
 * Provides methods to interact with the Open Library API for searching books,
 * retrieving work and author details, and constructing cover image URLs.
 * @module openLibraryClient
 */
import axios from "axios";
import { normalizeId } from "../../utils/validationHandler.js";

/**
 * Axios client configured for Open Library API.
 * @constant {Object}
 */
const client = axios.create({
  baseURL: "https://openlibrary.org",
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

// Interceptor to handle errors from Open Library API responses.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Open Library API Error:", error);
    throw new Error("Failed to fetch data from Open Library");
  },
);

/**
 * Searches for books in the Open Library database.
 *
 * @param {string} query - The search query string.
 * @param {number} [limit=20] - Maximum number of results to return.
 * @returns {Promise<{docs: Array}>} The search results containing book documents.
 * @throws {Error} If the API request fails.
 */
export async function searchBooks(query, limit = 20) {
  const res = await client.get("/search.json", { params: { q: query, limit } });
  return res.data;
}

/**
 * Retrieves detailed information about a specific work from Open Library.
 *
 * @param {string|number} openLibraryId - The Open Library work ID or key.
 * @returns {Promise<Object>} The work details including title, description, covers, and authors.
 * @throws {Error} If the work is not found or the API request fails.
 */
export async function getWork(openLibraryId) {
  const id = normalizeId(openLibraryId);
  const res = await client.get(`/works/${id}.json`);
  return res.data;
}

/**
 * Retrieves detailed information about a specific author from Open Library.
 *
 * @param {string|number} authorKeyOrId - The Open Library author key or ID.
 * @returns {Promise<Object>} The author details including name and bio.
 * @throws {Error} If the author is not found or the API request fails.
 */
export async function getAuthor(authorKeyOrId) {
  const id = normalizeId(authorKeyOrId);
  const res = await client.get(`/authors/${id}.json`);
  return res.data;
}

/**
 * Builds a cover URL from a cover ID using a template pattern.
 *
 * @param {string|number|null|undefined} coverId - The cover ID.
 * @param {string} [baseUrl="https://covers.openlibrary.org/b/id"] - The base URL for the cover service.
 * @param {string} [size="L"] - The image size (S, M, or L).
 * @returns {string|null} The complete cover URL, or null if coverId is invalid.
 */
export function buildCoverUrl(
  coverId,
  baseUrl = "https://covers.openlibrary.org/b/id",
  size = "L",
) {
  if (!coverId) return null;
  return `${baseUrl}/${coverId}-${size}.jpg`;
}
