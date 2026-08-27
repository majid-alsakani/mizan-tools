# Mizan Tools

> **Free, privacy-conscious utilities for RTL, translation keys, image hygiene, and video-cover inspection.**

Mizan Tools is a small, Arabic-first tool platform for developers and designers. The first release includes six related utilities: physical CSS properties that may break bidirectional layouts, differences between `ar.json` and `en.json`, a color-contrast baseline, a RTL/LTR text-stress preview, local image compression, and official video-cover inspection for public YouTube and TikTok links.

## Why this focus?

The product intentionally begins with a narrow, repeated workflow rather than generic converters: developers need privacy-conscious tools, and Arabic/RTL layouts require more than translated labels. CSS logical properties adapt layout to writing direction, while language and direction metadata should be explicit rather than guessed.[^mdn][^w3c-i18n] Automated accessibility outputs are useful signals, not complete certification; manual review remains essential.[^w3c-eval]

## Tools

| Tool | Input | Output | Privacy |
|---|---|---|---|
| **RTL & CSS Scan** | HTML or CSS pasted in the browser | Directional-property findings and logical-CSS alternatives | Local only |
| **Translation Key Diff** | `ar.json` and `en.json` text | Missing keys, type differences, placeholder drift | Local only |
| **Contrast Baseline** | Two HEX colors | Contrast ratio and text-size baseline | Local only |
| **RTL Stress Preview** | Arabic and English labels | Text length, capacity, long-token, and direction-preview signals | Local only |
| **Image Compressor** | One JPG, PNG, or WebP image up to 20 MB | Compressed WebP/JPEG preview and browser download | Local only |
| **Video Cover Inspector** | Public YouTube or TikTok URL | Official thumbnail link, title, creator attribution, and source link | Requests go directly from the browser to the platform endpoints |

## Local development

No framework or package installation is required for the app itself. Serve the folder with any static server, or open `index.html` locally.

```bash
npm test
```

## Deliberate limitations

Mizan Tools does **not** claim WCAG conformance, legal compliance, comprehensive RTL correctness, or a substitute for native-language and accessibility review. The scanner checks deterministic patterns in pasted text; it does not crawl a URL, collect user code, or execute arbitrary JavaScript. Image compression occurs in the browser canvas: the current release accepts JPG, PNG, and WebP up to 20 MB; JPEG output flattens PNG transparency onto white, while WebP is the default format for retaining transparency where supported.

Video Cover Inspector does not download video or remove attribution. It displays metadata and cover-image links returned or identified by official platform paths. YouTube downloads are offered only for content the user owns or is authorized to use; TikTok CDN restrictions can prevent browser download, so the tool preserves a link to the official image source instead. YouTube does not guarantee `maxres` availability for every video because thumbnail dimensions depend on the underlying resource and original resolution.[^youtube-thumb] TikTok documents its oEmbed endpoint as returning an embed code and additional video information, including a thumbnail URL in its example response.[^tiktok-oembed]

## Roadmap

The next useful additions are a structured locale metadata validator, an AR/EN UI-length stress preview, and optional offline export/import of results. A URL crawler is intentionally not the first feature because it introduces CORS, privacy, and security concerns; local pasted input is the safer first release.

## Sources

[^mdn]: [MDN — CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values)
[^w3c-i18n]: [W3C — Strings on the Web: Language and Direction Metadata](https://www.w3.org/TR/string-meta/)
[^w3c-eval]: [W3C WAI — Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/)
[^youtube-thumb]: [YouTube Data API — Thumbnails](https://developers.google.com/youtube/v3/docs/thumbnails)
[^tiktok-oembed]: [TikTok for Developers — Embed Videos](https://developers.tiktok.com/doc/embed-videos/)
