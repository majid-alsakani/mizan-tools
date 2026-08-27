import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMAGE_BYTES, createDownloadName, formatBytes, getTargetDimensions, validateImageFile } from "../src/image-compressor.js";

test("validates image type and file size without reading image bytes", () => {
  assert.equal(validateImageFile({ type: "image/jpeg", size: 512 }), null);
  assert.match(validateImageFile({ type: "image/gif", size: 512 }), /JPG/);
  assert.match(validateImageFile({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }), /20 MB/);
});

test("resizes only when the longest edge exceeds configured maximum", () => {
  assert.deepEqual(getTargetDimensions(4000, 2000, 2000), { width: 2000, height: 1000, resized: true });
  assert.deepEqual(getTargetDimensions(800, 600, 2000), { width: 800, height: 600, resized: false });
});

test("formats sizes and compressed download names predictably", () => {
  assert.equal(formatBytes(1024), "1.0 KB");
  assert.equal(createDownloadName("banner.final.png", "image/webp"), "banner.final-mizan.webp");
});
