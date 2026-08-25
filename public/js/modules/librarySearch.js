/** Filters the rendered library list without a network request. */
export function initLibrarySearch() {
  const input = document.querySelector("[data-library-search]");
  if (!input) return;

  const clearButton = document.querySelector("[data-library-search-clear]");
  const emptyMessage = document.querySelector("[data-library-search-empty]");
  const count = document.querySelector("[data-library-count]");
  const filter = () => {
    const query = input.value.trim().toLowerCase();
    const books = [...document.querySelectorAll("[data-library-book]")];
    let visibleCount = 0;
    books.forEach((book) => {
      const searchableText =
        book.dataset.searchText || book.textContent.toLowerCase();
      const matches = searchableText.includes(query);
      book.hidden = !matches;
      if (matches) visibleCount += 1;
    });
    clearButton.hidden = !query;
    emptyMessage.hidden = !query || visibleCount !== 0;
    count.textContent = query
      ? `${visibleCount} ${visibleCount === 1 ? "result" : "results"}`
      : `${books.length} ${books.length === 1 ? "book" : "books"}`;
  };

  input.addEventListener("input", filter);
  clearButton.addEventListener("click", () => {
    input.value = "";
    input.focus();
    filter();
  });
  filter();
}
