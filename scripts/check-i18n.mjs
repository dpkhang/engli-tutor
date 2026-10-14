#!/usr/bin/env node
// Fails when code calls t("...") with a key that is missing from any locale,
// or when locales do not share the same set of keys.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES_DIR = path.join(ROOT, "packages/i18n/src/messages");
const SOURCE_DIRS = ["apps", "packages"].map((dir) => path.join(ROOT, dir));
const IGNORED_DIRS = new Set(["node_modules", ".next", "dist"]);
const KEY_CALL = /\bt\(\s*(["'`])([A-Za-z0-9_.-]+)\1/g;

function flatten(tree, prefix = "", keys = new Set()) {
  for (const [name, value] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${name}` : name;
    if (value && typeof value === "object") flatten(value, key, keys);
    else keys.add(key);
  }
  return keys;
}

function sourceFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(fullPath, files);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

const locales = Object.fromEntries(
  fs
    .readdirSync(MESSAGES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => [
      path.basename(file, ".json"),
      flatten(JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, file), "utf8"))),
    ]),
);

const errors = [];

for (const file of SOURCE_DIRS.flatMap((dir) => sourceFiles(dir))) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(KEY_CALL)) {
    const key = match[2];
    const missing = Object.keys(locales).filter((locale) => !locales[locale].has(key));
    if (missing.length === 0) continue;
    const line = source.slice(0, match.index).split("\n").length;
    errors.push(`${path.relative(ROOT, file)}:${line}  "${key}" missing in ${missing.join(", ")}`);
  }
}

const [baseLocale, ...otherLocales] = Object.keys(locales);
for (const locale of otherLocales) {
  for (const [from, to] of [[baseLocale, locale], [locale, baseLocale]]) {
    for (const key of locales[from]) {
      if (!locales[to].has(key)) errors.push(`messages/${to}.json  "${key}" exists in ${from} but not in ${to}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`i18n check failed (${errors.length}):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`i18n check passed (${Object.keys(locales).join(", ")}).`);
