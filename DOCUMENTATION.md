# Documentation

Booklyte generates both HTML and Markdown from JSDoc comments.

```bash
npm run docs            # HTML in docs/
npm run docs:wiki       # Markdown in wiki-local/Home.md
```

`npm run docs:wiki` accepts `WIKI_DIR` when the target is a local clone of the
GitHub Wiki:

```bash
WIKI_DIR=../Booklyte.wiki npm run docs:wiki
```

Pushing to `main` runs `.github/workflows/documentation.yml`. It generates both
formats, then commits the generated `Home.md` to the repository Wiki. Before
the first run, enable the Wiki in GitHub and add a `WIKI_TOKEN` repository secret
with fine-grained **Contents: Read and write** access to this repository.

Add JSDoc to source files as usual:

```js
/**
 * Formats a publication date.
 * @param {string} dateString - An ISO date string.
 * @returns {string} A display-ready date.
 */
```
