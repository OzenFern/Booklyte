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
  });
});
