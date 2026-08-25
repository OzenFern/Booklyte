/**
 * Integration tests for the live Open Library API.
 *
 * These tests exercise the real HTTP client to ensure the integration layer
 * can still talk to Open Library and shape the returned data.
 */

import { describe, expect, it } from "vitest";
import {
  getAuthor,
  getWork,
  searchBooks,
  buildCoverUrl,
} from "../../src/integrations/openLibrary/openLibraryClient.js";
import { normalizeId } from "../../src/utils/validationHandler.js";

describe("openLibraryApi", () => {
  it("searchBooks can fetch a live work and author from Open Library", async () => {
    // Arrange: use a stable, popular title so the API returns at least one work.
    const searchResponse = await searchBooks("Dune", 5);

    // Assert: the search endpoint returns usable work data.
    expect(searchResponse.docs).toBeInstanceOf(Array);
    expect(searchResponse.docs.length).toBeGreaterThan(0);

    const firstWork = searchResponse.docs.find((doc) => doc?.key);
    expect(firstWork).toBeDefined();

    const workId = normalizeId(firstWork.key);
    expect(workId).toBeTruthy();

    const work = await getWork(workId);

    // Assert: the work endpoint returns the same work and includes authors.
    expect(normalizeId(work.key)).toBe(workId);
    expect(work.title).toEqual(expect.any(String));
    expect(work.authors).toBeInstanceOf(Array);
    expect(work.authors.length).toBeGreaterThan(0);

    const authorKey = work.authors[0]?.author?.key ?? work.authors[0]?.key;
    expect(authorKey).toBeTruthy();

    const author = await getAuthor(authorKey);

    // Assert: the author endpoint returns a populated author record.
    expect(author.name).toEqual(expect.any(String));
  }, 15000);

  it("searchBooks handles empty results gracefully", async () => {
    // Arrange: use a very specific query that might return no results.
    const searchResponse = await searchBooks("xyzabc123nonexistentbook", 5);

    // Assert: the search endpoint returns an empty array.
    expect(searchResponse.docs).toBeInstanceOf(Array);
    expect(searchResponse.docs.length).toBe(0);
  }, 15000);

  it("getWork handles invalid work IDs", async () => {
    // Arrange: use an invalid work ID.
    const invalidId = "invalid-work-id-12345";

    // Assert: the endpoint should throw an error.
    await expect(getWork(invalidId)).rejects.toThrow();
  }, 15000);

  it("getAuthor handles invalid author IDs", async () => {
    // Arrange: use an invalid author ID.
    const invalidId = "invalid-author-id-12345";

    // Assert: the endpoint should throw an error.
    await expect(getAuthor(invalidId)).rejects.toThrow();
  }, 15000);

  it("buildCoverUrl returns correct URL for valid cover ID", () => {
    // Arrange: use a valid cover ID.
    const coverId = "12345";

    // Act: build the cover URL.
    const url = buildCoverUrl(coverId);

    // Assert: the URL is correctly formatted.
    expect(url).toBe("https://covers.openlibrary.org/b/id/12345-L.jpg");
  });

  it("buildCoverUrl returns null for null cover ID", () => {
    // Arrange: use null cover ID.
    const coverId = null;

    // Act: build the cover URL.
    const url = buildCoverUrl(coverId);

    // Assert: the result is null.
    expect(url).toBeNull();
  });

  it("buildCoverUrl returns null for undefined cover ID", () => {
    // Arrange: use undefined cover ID.
    const coverId = undefined;

    // Act: build the cover URL.
    const url = buildCoverUrl(coverId);

    // Assert: the result is null.
    expect(url).toBeNull();
  });

  it("buildCoverUrl supports custom size parameter", () => {
    // Arrange: use a valid cover ID and custom size.
    const coverId = "12345";
    const size = "M";

    // Act: build the cover URL with custom size.
    const url = buildCoverUrl(
      coverId,
      "https://covers.openlibrary.org/b/id",
      size,
    );

    // Assert: the URL includes the custom size.
    expect(url).toBe("https://covers.openlibrary.org/b/id/12345-M.jpg");
  });

  it("buildCoverUrl supports custom base URL", () => {
    // Arrange: use a valid cover ID and custom base URL.
    const coverId = "12345";
    const customBaseUrl = "https://custom.covers.com/id";

    // Act: build the cover URL with custom base URL.
    const url = buildCoverUrl(coverId, customBaseUrl);

    // Assert: the URL includes the custom base URL.
    expect(url).toBe("https://custom.covers.com/id/12345-L.jpg");
  });
});
