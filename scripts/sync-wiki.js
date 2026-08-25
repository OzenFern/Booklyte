#!/usr/bin/env node
/**
 * Generates the GitHub Wiki home page from the project's JSDoc comments.
 * The workflow is responsible for committing the resulting Markdown.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import jsdoc2md from "jsdoc-to-markdown";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const wikiDir = path.resolve(rootDir, process.env.WIKI_DIR ?? "wiki-local");

fs.mkdirSync(wikiDir, { recursive: true });

const markdown = await jsdoc2md.render({
  files: ["src/**/*.js", "public/js/**/*.js"],
});

const home = `# Booklyte API reference

This page is generated from JSDoc comments. Do not edit it manually.

${markdown}`;

fs.writeFileSync(path.join(wikiDir, "Home.md"), home);
console.log(
  `Wiki Markdown written to ${path.relative(rootDir, wikiDir)}/Home.md`,
);
