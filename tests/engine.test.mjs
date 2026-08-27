import test from "node:test";
import assert from "node:assert/strict";
import { compareTranslationJson, contrastCheck, scanRtlSource } from "../src/engine.js";

test("detects physical CSS properties and missing RTL metadata", () => {
  const issues = scanRtlSource('<html lang="ar"><style>.card { margin-left: 12px; text-align: left; }</style>');
  assert.equal(issues.some((issue) => issue.title.includes("margin-left")), true);
  assert.equal(issues.some((issue) => issue.title === "خاصية اتجاهية: left"), false);
  assert.equal(issues.some((issue) => issue.title.includes("dir")), true);
});

test("compares translation keys and placeholder tokens", () => {
  const result = compareTranslationJson('{"greeting":"مرحبًا {{name}}","onlyAr":"x"}', '{"greeting":"Hello {{user}}","onlyEn":"x"}');
  assert.deepEqual(result.missingInArabic, ["onlyEn"]);
  assert.deepEqual(result.missingInEnglish, ["onlyAr"]);
  assert.equal(result.placeholderMismatches[0].key, "greeting");
});

test("calculates a known contrast ratio and validates colors", () => {
  assert.equal(contrastCheck("#000000", "#FFFFFF").ratio, 21);
  assert.equal(contrastCheck("#000", "#fff").normalTextAA, true);
  assert.ok(contrastCheck("not-a-color", "#fff").error);
});
