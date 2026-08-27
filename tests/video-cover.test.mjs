import assert from "node:assert/strict";
import test from "node:test";
import { buildYouTubeThumbnailCandidates, isSafeExternalUrl, parseVideoUrl } from "../src/video-cover.js";

test("parses canonical, short, and shorts YouTube links", () => {
  assert.deepEqual(parseVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").videoId, "dQw4w9WgXcQ");
  assert.deepEqual(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ?t=3").videoId, "dQw4w9WgXcQ");
  assert.deepEqual(parseVideoUrl("https://youtube.com/shorts/dQw4w9WgXcQ").platform, "youtube");
});

test("accepts HTTPS TikTok URLs and rejects unrelated or unsafe links", () => {
  assert.equal(parseVideoUrl("https://www.tiktok.com/@creator/video/123").platform, "tiktok");
  assert.match(parseVideoUrl("http://www.youtube.com/watch?v=dQw4w9WgXcQ").error, /HTTPS/);
  assert.match(parseVideoUrl("https://example.com/video").error, /YouTube/);
  assert.equal(isSafeExternalUrl("https://i.ytimg.com/vi/example/hqdefault.jpg"), true);
  assert.equal(isSafeExternalUrl("javascript:alert(1)"), false);
});

test("builds ordered YouTube thumbnail candidates", () => {
  const candidates = buildYouTubeThumbnailCandidates("dQw4w9WgXcQ");
  assert.equal(candidates.length, 4);
  assert.match(candidates[0], /maxresdefault\.jpg$/);
  assert.match(candidates[2], /hqdefault\.jpg$/);
});
