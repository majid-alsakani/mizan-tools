# Mizan Tools

> **Free, browser-local utilities for RTL, translation keys, color contrast, and image compression.**

Mizan Tools is a small, Arabic-first tool platform for developers and designers. The first release runs entirely in the browser and includes five related utilities: physical CSS properties that may break bidirectional layouts, differences between `ar.json` and `en.json`, a color-contrast baseline, a RTL/LTR text-stress preview, and local image compression.

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

## Local development

No framework or package installation is required for the app itself. Serve the folder with any static server, or open `index.html` locally.

```bash
npm test
```

## Deliberate limitations

Mizan Tools does **not** claim WCAG conformance, legal compliance, comprehensive RTL correctness, or a substitute for native-language and accessibility review. The scanner checks deterministic patterns in pasted text; it does not crawl a URL, collect user code, or execute arbitrary JavaScript. Image compression occurs in the browser canvas: the current release accepts JPG, PNG, and WebP up to 20 MB; JPEG output flattens PNG transparency onto white, while WebP is the default format for retaining transparency where supported.

## Roadmap

The next useful additions are a structured locale metadata validator, an AR/EN UI-length stress preview, and optional offline export/import of results. A URL crawler is intentionally not the first feature because it introduces CORS, privacy, and security concerns; local pasted input is the safer first release.

## Sources

[^mdn]: [MDN — CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values)
[^w3c-i18n]: [W3C — Strings on the Web: Language and Direction Metadata](https://www.w3.org/TR/string-meta/)
[^w3c-eval]: [W3C WAI — Evaluating Web Accessibility](https://www.w3.org/WAI/test-evaluate/)
