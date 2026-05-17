---
name: data/engineering/liteparse
description: |
  LiteParse is a lightweight, local document-parsing CLI from LlamaIndex for turning unstructured files into clean text or structured JSON — no cloud dependencies, no LLM required. Use this skill when:
  (1) extracting text from PDFs, DOCX, PPTX, XLSX, or images as a data-ingestion step,
  (2) building a local or on-prem RAG pipeline that must not send documents to a cloud parser,
  (3) batch-parsing a directory of mixed-format documents into markdown or JSON for downstream indexing,
  (4) generating page screenshots of PDFs for multimodal LLM agents that need visual layout,
  (5) running OCR locally with Tesseract.js or delegating to a self-hosted EasyOCR / PaddleOCR HTTP server,
  (6) parsing documents at the edge or inside a customer VPC where cloud parsers (LlamaParse, Unstructured SaaS, Azure DI) are blocked by data residency.
license: MIT
compatibility: Node 18+. `@llamaindex/liteparse` global install. LibreOffice for Office formats, ImageMagick for images.
repository: https://github.com/2nth-ai/skills
requires: []
improves:
  - data/engineering
metadata:
  author: 2nth.ai
  version: "1.0.0"
  categories: "Document parsing, RAG ingestion, OCR, PDF extraction, Local-first"
allowed-tools: Bash(lit:*) Bash(npm:*) Bash(brew:*) Read Write Edit Glob Grep
---

# LiteParse — Local Document Parsing

LiteParse parses unstructured documents (PDF, DOCX, PPTX, XLSX, images) locally into clean text or structured JSON with bounding boxes. It is the lightweight sibling of LlamaParse: same LlamaIndex authorship, but nothing leaves the machine. For RAG pipelines that must respect POPIA, NHI, or client data-residency clauses, LiteParse is the ingestion layer.

CLI: `lit` (installed globally via `@llamaindex/liteparse`).

## Authentication

None. LiteParse runs entirely locally — no API key, no account, no network call. This is the whole point.

**Dependencies** (install once, not credentials):

```bash
# Core
npm i -g @llamaindex/liteparse

# Office formats (DOCX, PPTX, XLSX) — LibreOffice converts to PDF first
brew install --cask libreoffice        # macOS
apt-get install libreoffice            # Debian/Ubuntu

# Image inputs (JPG, PNG, TIFF, etc.)
brew install imagemagick               # macOS
apt-get install imagemagick            # Debian/Ubuntu

# Verify
lit --version
```

## Core patterns

### Parse a single file

```bash
# Plain text extraction
lit parse document.pdf

# Structured JSON with bounding boxes — the RAG-friendly output
lit parse document.pdf --format json -o output.json

# Target pages only (faster; useful for appendix-heavy PDFs)
lit parse document.pdf --target-pages "1-5,10,15-20"

# Text-only PDFs — skip OCR for a 3-10x speedup
lit parse document.pdf --no-ocr

# High-DPI render for small-text or scanned docs
lit parse document.pdf --dpi 300
```

### Batch-parse a directory

```bash
# All supported formats, flat output
lit batch-parse ./input ./output

# PDFs only, recursive descent — the common ingestion pattern
lit batch-parse ./input ./output --extension .pdf --recursive
```

### Page screenshots (for multimodal agents)

Useful when the agent needs to see layout, not just text — contracts, forms, scientific diagrams.

```bash
# All pages
lit screenshot document.pdf -o ./screenshots

# Specific pages at high DPI
lit screenshot document.pdf --pages "1,3,5" --dpi 300 --format png -o ./screenshots
```

### External OCR server (higher accuracy than Tesseract.js)

```bash
# Point LiteParse at a self-hosted EasyOCR or PaddleOCR server
lit parse scan.pdf --ocr-server-url http://localhost:8828/ocr

# The server must accept POST /ocr with multipart `file` + `language`,
# and return: { "results": [{ "text": "...", "bbox": [x1,y1,x2,y2], "confidence": 0.98 }] }
```

## Config file pattern

For repeated runs with the same settings, commit a `liteparse.config.json` alongside the ingestion script:

```json
{
  "ocrEnabled": true,
  "ocrLanguage": "en",
  "dpi": 150,
  "outputFormat": "json",
  "preciseBoundingBox": true,
  "maxPages": 1000,
  "skipDiagonalText": false,
  "preserveVerySmallText": false
}
```

Run with: `lit parse document.pdf --config liteparse.config.json`.

## Supported inputs

| Category | Extensions | Notes |
|---|---|---|
| PDF | `.pdf` | Native. Text and scanned both work (OCR fallback). |
| Word | `.doc .docx .docm .odt .rtf` | Converted to PDF via LibreOffice first. |
| PowerPoint | `.ppt .pptx .pptm .odp` | Same — LibreOffice conversion. |
| Spreadsheets | `.xls .xlsx .xlsm .ods .csv .tsv` | LibreOffice for binary formats. |
| Images | `.jpg .jpeg .png .gif .bmp .tiff .webp .svg` | ImageMagick wraps to PDF, then OCR. |

## Key options

| Option | Purpose |
|---|---|
| `--format json` / `--format text` | JSON has bounding boxes; text is flat output. |
| `--no-ocr` | Disable OCR entirely — faster, for pure-text PDFs. |
| `--ocr-language fra` | ISO code for Tesseract language pack. |
| `--ocr-server-url <url>` | Delegate OCR to an external HTTP server. |
| `--dpi <n>` | Default 150; use 300 for quality, 96 for speed. |
| `--target-pages "1-5,10"` | Parse a subset only. |
| `--max-pages <n>` | Hard cap — useful in batch jobs to prevent runaway docs. |
| `--no-precise-bbox` | Faster, coarser bounding boxes. |
| `--skip-diagonal-text` | Ignore rotated text (watermarks, stamps). |
| `--preserve-small-text` | Keep fine print that the default pass would drop. |

## TypeScript API

For in-process use from a Node service or Worker script:

```ts
import { parse } from "@llamaindex/liteparse";

const result = await parse("./document.pdf", {
  outputFormat: "json",
  ocrEnabled: true,
  dpi: 150,
});

// result.pages[i].blocks[j] = { text, bbox, confidence }
```

Does not run in Cloudflare Workers (requires native deps: pdfjs, LibreOffice shell-out, ImageMagick). Run LiteParse in a Node container or a user machine, then push the parsed JSON into Workers + Vectorize / D1 / R2 for serving.

## Common Gotchas

- **OCR is the slow step.** A 100-page scanned PDF with default Tesseract.js takes minutes, not seconds. Use `--no-ocr` for text-native PDFs, or delegate to an external OCR server for batch jobs. The cost is in OCR, not parsing.
- **LibreOffice headless is required for Office formats.** If `lit parse doc.docx` hangs or errors, LibreOffice is either missing or running as a GUI instance that's blocking the headless invocation. `pkill soffice` and retry.
- **ImageMagick security policy blocks PDFs by default on fresh installs.** If image parsing fails with "not authorized", edit `/etc/ImageMagick-6/policy.xml` and remove the `<policy domain="coder" rights="none" pattern="PDF" />` line. Known issue, well-documented upstream.
- **Tesseract.js bundles a single default language.** For non-English docs, pass `--ocr-language <iso>` and ensure the trained data for that language has been downloaded — the first run is slow while it pulls the language pack.
- **Bounding boxes are in PDF point coordinates (72 DPI), not pixel coordinates.** If you render screenshots at 300 DPI and overlay the bounding boxes, multiply by `dpi/72`. Trips up every integration on first attempt.
- **`batch-parse` is not parallel by default.** Large directories process serially. For throughput, shard the input directory and run multiple `lit batch-parse` processes with different output paths — or drop down to the TypeScript API and use `Promise.all` with a concurrency limit.

## When to use LiteParse vs alternatives

| Use case | Tool |
|---|---|
| Local-first / POPIA / client VPC | **LiteParse** |
| Cloud-OK, want best-in-class parse quality | LlamaParse (cloud, paid) |
| Enterprise on-prem at high volume | Unstructured.io (self-hosted) |
| Azure ecosystem | Azure Document Intelligence |
| Simple text-only PDFs | `pdftotext` (poppler) — no bbox, no OCR |

## See Also

- [data/engineering](../SKILL.md) — parent domain (ETL/ELT context)
- [tech/cloudflare/vectorize](../../../tech/cloudflare/vectorize/SKILL.md) — embed parsed chunks into a vector DB
- [tech/cloudflare/r2](../../../tech/cloudflare/r2/SKILL.md) — store parsed JSON alongside source documents
- LlamaIndex LiteParse repo: https://github.com/run-llama/LiteParse
