import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const htmlPath = join(distDir, "index.html");
let html = await readFile(htmlPath, "utf8");

const cssLinks = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi)];
for (const [tag, href] of cssLinks) {
  const cssPath = join(distDir, href.replace(/^\//, ""));
  const css = await readFile(cssPath, "utf8");
  html = html.replace(tag, () => `<style>${css}</style>`);
}

const scripts = [...html.matchAll(/<script([^>]*)src=["']([^"']+)["']([^>]*)><\/script>/gi)];
for (const [tag, , src] of scripts) {
  const scriptPath = join(distDir, src.replace(/^\//, ""));
  const js = await readFile(scriptPath, "utf8");
  const safeJs = js.replace(/<\/script/gi, "<\\/script");
  html = html.replace(tag, () => `<script type="module">${safeJs}</script>`);
}

html = html.replace(/\s*<link[^>]+rel=["']modulepreload["'][^>]*>/gi, "");
await writeFile(htmlPath, html);

const entries = await readdir(distDir, { withFileTypes: true });
for (const entry of entries) {
  if (entry.name !== "index.html") {
    await rm(join(distDir, entry.name), { recursive: true, force: true });
  }
}

console.log(`Created single-file web bundle: ${htmlPath}`);
