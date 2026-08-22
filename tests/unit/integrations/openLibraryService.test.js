/**
 * Unit tests for the Open Library service integration.
 *
 * These tests validate the service's mapping logic while allowing the Open
 * Library client to be mocked.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getWorkDetails,
  searchExternalBooks,
} from "../../../src/integrations/openLibrary/openLibraryService.js";

const mocks = vi.hoisted(() => ({
  searchBooks: vi.fn(),
  getWork: vi.fn(),
  getAuthor: vi.fn(),
  buildCoverUrl: vi.fn(
    (coverId, baseUrl = "https://covers.openlibrary.org/b/id", size = "L") =>
      `${baseUrl}/${coverId}-${size}.jpg`,
  ),
}));

vi.mock("../../../src/integrations/openLibrary/openLibraryClient.js", () => ({
  searchBooks: mocks.searchBooks,
  getWork: mocks.getWork,
  getAuthor: mocks.getAuthor,
  buildCoverUrl: mocks.buildCoverUrl,
}));

describe("openLibraryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchExternalBooks maps Open Library search results into application data", async () => {
    // Arrange: the client returns a search document with the fields used by the mapper.
    const response = {
      docs: [
        {
          key: "/works/OL1234W",
          title: "Dune",
          subtitle: "A novel",
          cover_i: 12345,
          first_publish_year: 1965,
          author_name: ["Frank Herbert"],
          author_key: ["/authors/OL216228A"],
        },
      ],
    };
    mocks.searchBooks.mockResolvedValue(response);

    // Act: map the raw search response into the database shape.
    const result = await searchExternalBooks("dune", 5);

    // Assert: the mapper normalizes IDs, dates, covers, and author data.
    expect(mocks.searchBooks).toHaveBeenCalledWith("dune", 5);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      openlibrary_id: "OL1234W",
      title: "Dune",
      description: "A novel",
      cover_url: "https://covers.openlibrary.org/b/id/12345-L.jpg",
      published_date: "1965",
      authors: [
        {
          openlibrary_id: "OL216228A",
          name: "Frank Herbert",
        },
      ],
    });
  });

  it("searchExternalBooks returns an empty array when no docs are returned", async () => {
    // Arrange: the search endpoint has no matches.
    mocks.searchBooks.mockResolvedValue({ docs: [] });

    // Act/Assert: the mapper should return a clean empty result set.
    await expect(searchExternalBooks("unknown title")).resolves.toEqual([]);
  });

  it("searchExternalBooks propagates client errors", async () => {
    // Arrange: the upstream search request fails.
    mocks.searchBooks.mockRejectedValue(new Error("Search failed"));

    // Act/Assert: the mapper should not swallow client failures.
    await expect(searchExternalBooks("dune")).rejects.toThrow("Search failed");
  });

  it("getWorkDetails maps Open Library work data and skips missing authors", async () => {
    // Arrange: the work contains two authors, but only one author lookup succeeds.
    mocks.getWork.mockResolvedValue({
      key: "/works/OL82563W",
      title: "Dune",
      description: { value: "Epic science fiction." },
      covers: [67890],
      first_publish_date: "1965",
      authors: [
        { author: { key: "/authors/OL216228A" } },
        { author: { key: "/authors/OL9999999A" } },
      ],
    });
    mocks.getAuthor
      .mockResolvedValueOnce({
        key: "/authors/OL216228A",
        name: "Frank Herbert",
      })
      .mockRejectedValueOnce(new Error("Author lookup failed"));

    // Act: fetch and normalize the work details.
    const result = await getWorkDetails("OL82563W");

    // Assert: the mapper returns normalized work fields and filters bad author lookups.
    expect(mocks.getWork).toHaveBeenCalledWith("OL82563W");
    expect(mocks.getAuthor).toHaveBeenCalledWith("/authors/OL216228A");
    expect(mocks.getAuthor).toHaveBeenCalledWith("/authors/OL9999999A");
    expect(result).toMatchObject({
      openlibrary_id: "OL82563W",
      title: "Dune",
      description: "Epic science fiction.",
      cover_url: "https://covers.openlibrary.org/b/id/67890-L.jpg",
      published_date: "1965",
      authors: [
        {
          openlibrary_id: "OL216228A",
          name: "Frank Herbert",
        },
      ],
    });
  });

  it("getWorkDetails propagates work lookup errors", async () => {
    // Arrange: the work endpoint fails before any author lookups can run.
    mocks.getWork.mockRejectedValue(new Error("Work failed"));

    // Act/Assert: the mapper should surface the upstream failure.
    await expect(getWorkDetails("OL82563W")).rejects.toThrow("Work failed");
  });
});
