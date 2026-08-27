# Mizan Tools Product Roadmap

## Product thesis

Mizan Tools should become a recognizable collection of **Arabic-first engineering utilities**, not a catalog of unrelated generators. The shared promise is simple: help teams discover defects before a translated interface reaches users, while keeping code and content local whenever feasible.

## Prioritised roadmap

| Priority | Tool | User problem | Why it belongs |
|---:|---|---|---|
| 1 | RTL & CSS Scan | Physical layout properties and missing direction metadata | Extends the existing Mizan CLI into a frictionless web entry point |
| 2 | Translation Key Diff | Missing Arabic or English keys and broken placeholders | Gives localization teams a repeatable pre-merge check |
| 3 | Contrast Baseline | Low contrast in components | Small, instant, and useful across every product language |
| 4 | Image Compressor | Large image assets delay web pages | Delivered locally with format, quality, resize, preview, and download controls |
| 5 | RTL Stress Preview | Reveal overflow with long Arabic labels | Delivered in the first web release as a local component preview |
| 6 | Video Cover Inspector | Creators need a quick way to inspect public YouTube/TikTok cover art with source attribution | Delivered using documented oEmbed and thumbnail paths; no video download |
| 7 | Locale Metadata Validator | Missing `lang`, `dir`, and metadata contracts in JSON | Natural next step after key parity, image hygiene, and stress testing |

## Growth approach

Each tool requires a dedicated indexable page, a short Arabic/English explainer, a concrete input example, and a transparent limitations section. Link the web tools, the open-source CLI, and companion CI presets so an anonymous visitor can progress from a free check to repeatable team workflow.

## What not to build first

Avoid generic PDF/image converters, anonymous “AI checker” claims, account walls, and broad all-in-one dashboards. They are crowded, blur the product promise, or create privacy and operations costs before product-market evidence.
