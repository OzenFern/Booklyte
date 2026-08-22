import * as olc from "./openLibraryClient.js";
import {
  normalizeId,
  extractStringValue,
} from "../../utils/validationHandler.js";

/**
 * Searches for books in the Open Library database and normalizes the response.
 *
 * @param {string} query - The search query string.
 * @param {number} limit - Maximum number of results to return.
 * @returns {Promise<Array<Object>>}
 * Each object in the array contains the following fields:
 *   - `openlibrary_id`: The normalized Open Library ID of the book.
 *   - `title`: The title of the book.
 *   - `description`: A brief description or subtitle of the book.
 *   - `cover_url`: URL to the book's cover image, if available.
 *   - `published_date`: The year the book was first published, as a string.
 *   - `authors`: An array of author objects, each containing:
 *   - `openlibrary_id`: The normalized Open Library ID of the author.
 *    - `name`: The name of the author.
 *   Array of normalized book objects with standard fields.
 * @throws {Error} If the API request fails.
 */
export async function searchExternalBooks(query, limit) {
  const data = await olc.searchBooks(query, limit);
  const docs = data.docs || [];

  return docs.map((doc) => {
    const rawId = doc.key || doc.cover_edition_key || doc.edition_key?.[0];

    return {
      openlibrary_id: normalizeId(rawId),
      title: doc.title ?? null,
      description: doc.subtitle || doc.first_sentence || null,
      cover_url: doc.cover_i ? olc.buildCoverUrl(doc.cover_i) : null,
      published_date: doc.first_publish_year
        ? String(doc.first_publish_year)
        : null,
      authors: (doc.author_name || []).map((name, i) => ({
        openlibrary_id: normalizeId(doc.author_key?.[i]),
        name,
      })),
    };
  });
}

/**
 * Retrieves detailed information about a specific work including author details.
 *
 * @param {string|number} openLibraryId - The Open Library work ID or key.
 * @returns {Promise<{openlibrary_id: string|null, title: string|null, description: string|null, cover_url: string|null, published_date: string|null, authors: Array<{openlibrary_id: string|null, name: string|null}>}>}
 *   The normalized work details with authors.
 * @throws {Error} If the work is not found or the API request fails.
 */
export async function getWorkDetails(openLibraryId) {
  const work = await olc.getWork(openLibraryId);

  const description = extractStringValue(work.description);
  const cover_url = work.covers?.[0] ? olc.buildCoverUrl(work.covers[0]) : null;

  const rawAuthors = Array.isArray(work.authors) ? work.authors : [];

  const authors = await Promise.all(
    rawAuthors.map(async (a) => {
      try {
        const authorKey = a.author?.key ?? a.key;
        if (!authorKey) return null;

        const author = await olc.getAuthor(authorKey);
        return {
          openlibrary_id: normalizeId(author.key),
          name: author.name ?? null,
        };
      } catch (err) {
        return null;
      }
    }),
  );

  return {
    openlibrary_id: normalizeId(work.key) || openLibraryId,
    title: work.title ?? null,
    description,
    cover_url,
    published_date: work.first_publish_date ?? work.created?.value ?? null,
    authors: authors.filter(Boolean),
  };
}
