# LowDoc — FINAL MASTER CONCEPT
## UNIVERSAL FILE TRANSFORMATION PLATFORM
### Complete Change Plan + PRD + Technical Blueprint + OpenCode Build Prompt

**Project:** LowDoc  
**Current deployment:** `lowdoc.vercel.app`  
**Project Type:** Free public utility + portfolio project  
**Architecture:** Local-first / Privacy-first / Browser-native  
**Frontend:** Next.js + React + TypeScript  
**Deployment:** Vercel  
**Processing:** WebAssembly + Web Workers + Browser APIs  
**Database:** NONE  
**Authentication:** NONE  
**Cloud File Storage:** NONE  
**Required Paid API:** NONE  
**Core Principle:** Fidelity First  
**Secondary Principle:** Privacy by Architecture

---

# 1. FINAL PRODUCT DEFINITION

LowDoc is a universal browser-based file transformation platform designed to convert, resize, compress, optimize, inspect, preview, and manipulate files directly on the user's device.

LowDoc is not merely a PDF converter.

LowDoc is not merely a document converter.

LowDoc is intended to become a:

> **Universal File Transformation Toolkit**

with a strong focus on:

> **Preserving the original structure, layout, formatting, dimensions, and visual appearance of files whenever technically possible.**

---

# 2. CORE PRODUCT PROMISE

## Primary Promise

> **Transform your files without losing what matters.**

## Supporting Promise

> Convert. Resize. Compress. Preview. Preserve.

## Privacy Promise

> No account. No database. No document upload.

## Technical Promise

> Processing happens directly in your browser whenever technically possible.

---

# 3. LOWDOC'S MOST IMPORTANT DIFFERENTIATOR

Most converters compete through:

> "We support 100+ formats."

LowDoc should compete through:

> **"We care what your file looks like after conversion."**

The primary quality metric is therefore not the number of supported formats.

The primary quality metric is:

# FIDELITY

LowDoc should preserve:

- layout;
- page dimensions;
- orientation;
- margins;
- typography;
- font characteristics;
- paragraph structure;
- line spacing;
- tables;
- images;
- headers;
- footers;
- page breaks;
- alignment;
- colors;
- links;
- metadata where possible;
- document structure.

When perfect preservation is technically impossible, LowDoc must explain what may change.

---

# 4. NON-NEGOTIABLE PRODUCT PRINCIPLES

## 4.1 No Account

Users never need to register to use core functionality.

## 4.2 No Database

LowDoc must not depend on a database.

## 4.3 No Cloud Document Storage

User files are not stored remotely.

## 4.4 No Mandatory Upload

Normal processing must happen locally whenever possible.

## 4.5 No Artificial Conversion Limits

Do not introduce arbitrary "5 conversions per day" limitations.

## 4.6 Free Core Utility

Core functionality should remain free.

## 4.7 Fidelity First

A conversion should prioritize preserving the source.

## 4.8 Honest Compatibility

Unsupported or unreliable conversions must never be presented as fully supported.

## 4.9 Progressive Universalism

The system must be architected to continuously expand format support.

## 4.10 Privacy by Architecture

Privacy should come from the architecture itself.

---

# 5. UNIVERSAL FORMAT VISION

LowDoc should aim to support as many real-world file formats as technically feasible.

The architecture must not hardcode a small fixed list of formats.

Instead:

```text
Format
   ↓
Format Registry
   ↓
Engine Capability Registry
   ↓
Conversion Graph
   ↓
Available Transformations
```

---

# 6. FORMAT ECOSYSTEM

LowDoc should eventually cover major categories.

## 6.1 Office Documents

- DOC
- DOCX
- DOT
- DOTX
- ODT
- OTT
- RTF
- WPS
- WPD
- SXW
- legacy word-processing formats

## 6.2 Spreadsheets

- XLS
- XLSX
- XLSM
- XLSB where technically feasible
- ODS
- CSV
- TSV
- DIF
- DBF

## 6.3 Presentations

- PPT
- PPTX
- PPTM
- ODP
- POT
- POTX
- KEY where technically feasible

## 6.4 PDF

- PDF

PDF receives its own complete tool ecosystem.

## 6.5 Plain / Structured Text

- TXT
- MD
- Markdown
- HTML
- XHTML
- XML
- JSON
- YAML
- TOML
- CSV
- TSV
- LaTeX
- TEX

## 6.6 E-books

- EPUB
- MOBI
- AZW where technically feasible
- FB2
- CBZ
- CBR where technically feasible

## 6.7 Images

- JPG
- JPEG
- PNG
- WebP
- AVIF
- GIF
- SVG
- BMP
- TIFF
- ICO
- HEIC
- HEIF
- RAW formats where feasible

## 6.8 Archives

- ZIP
- TAR
- GZIP
- BZIP2
- XZ
- 7Z where technically feasible
- other safe archive formats where browser processing permits

## 6.9 Audio

Future architecture should allow:

- MP3
- WAV
- FLAC
- OGG
- AAC
- M4A
- OPUS
- AIFF

## 6.10 Video

Future architecture should allow:

- MP4
- WebM
- MOV
- MKV
- AVI
- MPEG
- OGV

## 6.11 Graphics / Design

Potential support:

- PSD
- AI
- EPS
- SVG
- DXF
- CAD-related formats where technically feasible

## 6.12 Data / Scientific

Potential support:

- JSON
- XML
- CSV
- TSV
- YAML
- Parquet
- SQLite
- database-export formats where safe and technically feasible

## 6.13 Other Specialized Formats

The format architecture must allow future engines for:

- CAD
- GIS
- scientific data
- publishing
- ebook
- archive
- design
- multimedia
- legacy formats

---

# 7. IMPORTANT: UNIVERSAL DOES NOT MEAN FALSE PROMISES

LowDoc must never display:

> "Every file can convert to every other file."

Some transformations are inherently meaningless.

For example:

- JPG → DOCX
- MP3 → XLSX
- ZIP → PDF

may technically have possible interpretations but are not necessarily meaningful conversions.

Therefore LowDoc uses a:

# Conversion Graph

instead of pretending every format pair is valid.

---

# 8. CONVERSION CAPABILITY STATES

Every transformation has a capability status.

### SUPPORTED

Reliable conversion.

### HIGH FIDELITY

Reliable and strong preservation.

### LIMITED

Works but some information may change.

### EXPERIMENTAL

Available but not yet reliable enough for general guarantees.

### LOSSY

Information loss is expected.

### UNSUPPORTED

Not currently available.

### INVALID

The requested transformation has no meaningful interpretation.

---

# 9. FIDELITY ENGINE

Create a dedicated:

# LowDoc Fidelity Engine

The Fidelity Engine is responsible for analyzing and validating transformation quality.

Pipeline:

```text
INPUT
  ↓
Format Detection
  ↓
Document/File Analysis
  ↓
Structure Analysis
  ↓
Page Analysis
  ↓
Conversion
  ↓
Output Analysis
  ↓
Visual / Structural Comparison
  ↓
Fidelity Report
```

---

# 10. DOCUMENT ANALYZER

Every supported document transformation should begin with analysis.

Detect where possible:

- file type;
- MIME;
- extension;
- page count;
- page dimensions;
- paper size;
- orientation;
- margins;
- fonts;
- images;
- tables;
- headers;
- footers;
- text blocks;
- metadata;
- embedded objects;
- hyperlinks;
- document structure.

---

# 11. PAPER SIZE DETECTION

This is a mandatory feature for document formats.

LowDoc must detect original page dimensions.

Example:

```text
Document
PDF

Pages:
12

Paper:
A4

Dimensions:
210 × 297 mm

Orientation:
Portrait
```

If the dimensions do not match a known preset:

```text
Custom
210 × 315 mm
```

The system must not incorrectly classify custom dimensions as A4.

---

# 12. PAPER SIZE ENGINE

Support a comprehensive paper-size database.

## ISO A

- A0
- A1
- A2
- A3
- A4
- A5
- A6
- A7
- A8
- A9
- A10

## ISO B

- B0
- B1
- B2
- B3
- B4
- B5
- B6
- B7
- B8
- B9
- B10

## ISO C

- C0
- C1
- C2
- C3
- C4
- C5
- C6
- C7
- C8
- C9
- C10

## International / US

- Letter
- Legal
- Tabloid
- Ledger
- Executive
- Statement
- Folio

## Regional

- F4
- Folio
- Quarto
- other known regional standards

## Custom

Users can specify:

- width;
- height;
- unit;
- orientation;
- margins.

---

# 13. SEARCHABLE PAPER SELECTOR

Paper size selection must support search.

Example:

```text
Paper Size

[ Search paper size... ]

A4
210 × 297 mm

F4
210 × 330 mm

Letter
216 × 279 mm

Legal
216 × 356 mm

A3
297 × 420 mm

Custom
```

Search must understand:

- name;
- abbreviation;
- dimensions.

Examples:

`F4`

`Legal`

`210 x 330`

`8.27 x 11.69`

---

# 14. DOCUMENT PREVIEW ENGINE

After conversion, users must be able to preview the result before downloading.

Preview capabilities:

- page rendering;
- zoom;
- page navigation;
- fit width;
- fit page;
- fullscreen;
- page count;
- paper-size indicator.

---

# 15. MULTI-PAPER PREVIEW

Example:

```text
Converted Output

Original:
A4

Preview:
[ A4 ▼ ]

Options:
A4
F4
A3
A5
Letter
Legal
Custom
```

When selecting another paper size:

> The preview must show how the document would look under that page configuration.

---

# 16. SAVE WITH SELECTED PAPER SIZE

Preview changes must not be cosmetic.

When the user chooses:

```text
F4
210 × 330 mm
```

and clicks:

> Save as F4

the generated document must actually use that page size.

---

# 17. LAYOUT ADAPTATION MODES

Changing paper size requires different strategies.

## Preserve Layout

Maintain original positions and dimensions wherever possible.

## Fit to Page

Scale/reposition content to fit.

## Reflow

Recalculate document layout according to the new page dimensions.

## Scale

Scale the entire page proportionally.

## Custom

Allow manual control.

---

# 18. MARGIN MANAGEMENT

Detect original margins where possible.

Example:

```text
Original A4

Top: 20 mm
Right: 20 mm
Bottom: 20 mm
Left: 25 mm
```

When changing to F4:

```text
F4

Top: 20
Right: 20
Bottom: 20
Left: 25
```

Users can modify them.

---

# 19. ORIENTATION

Support:

- Portrait
- Landscape
- Auto

Never silently rotate documents.

---

# 20. PDF → DOCX FIDELITY PIPELINE

PDF → DOCX requires structural reconstruction.

Pipeline:

```text
PDF
 ↓
Page Analysis
 ↓
Text Detection
 ↓
Font Analysis
 ↓
Image Detection
 ↓
Table Detection
 ↓
Position Analysis
 ↓
Reading Order Analysis
 ↓
Structure Reconstruction
 ↓
DOCX Generation
 ↓
Validation
```

---

# 21. DOCX → PDF FIDELITY PIPELINE

```text
DOCX
 ↓
Structure Parsing
 ↓
Page Settings
 ↓
Font Resolution
 ↓
Layout Engine
 ↓
PDF Rendering
 ↓
Visual Validation
```

The output should preserve the appearance of the source as closely as possible.

---

# 22. VISUAL COMPARISON

Provide:

## Side-by-side

Original | Converted

## Overlay

Original + Converted

## Difference View

Highlight significant visual differences.

---

# 23. FIDELITY REPORT

Example:

```text
Conversion Complete

PDF → DOCX

Original:
A4 · Portrait · 12 pages

Output:
A4 · Portrait · 12 pages

Fidelity Analysis

Text                 ✓
Page Structure       ✓
Images               ✓
Tables               ✓
Margins              ✓
Fonts                ⚠
Page Breaks          ✓

Warnings:
1 font substituted.

Overall:
High Fidelity
```

Do not claim a mathematically exact percentage unless the metric is genuinely meaningful.

---

# 24. FONT ENGINE

Detect:

- font family;
- size;
- weight;
- style;
- availability;
- embedded fonts.

Warn about missing fonts.

Example:

```text
⚠ Calibri is unavailable.

The output may have minor layout differences.
```

---

# 25. STRUCTURE ENGINE

Recognize:

- paragraphs;
- headings;
- lists;
- tables;
- images;
- headers;
- footers;
- page numbers;
- hyperlinks;
- text boxes;
- columns;
- sections.

---

# 26. UNIVERSAL RESIZE

LowDoc must distinguish different meanings of "resize."

## Image Resize

Change dimensions.

## File Size Reduction

Reduce bytes.

## Document Page Resize

Change paper dimensions.

## Media Resize

Change resolution/bitrate/dimensions.

## Archive Optimization

Reduce archive size where possible.

The UI should never call every operation simply "resize."

---

# 27. COMPRESSION

Support:

- quality-based compression;
- target size;
- resolution reduction;
- metadata removal;
- format optimization.

Show:

```text
Original:
8.2 MB

Target:
< 1 MB

Result:
840 KB
```

---

# 28. IMAGE TOOLS

- Convert
- Resize
- Compress
- Crop
- Rotate
- Flip
- Metadata
- Optimize
- Batch process

---

# 29. PDF TOOLS

### Organization

- Merge
- Split
- Extract
- Delete
- Reorder
- Rotate

### Conversion

- PDF → Image
- Image → PDF
- PDF → Text
- PDF → HTML
- PDF → DOCX where supported

### Optimization

- Compress
- Optimize
- Metadata removal

### Editing

Where technically feasible:

- watermark;
- text;
- image;
- page numbers;
- annotations;
- basic forms.

---

# 30. DOCUMENT TOOLS

- Convert
- Preview
- Inspect
- Extract text
- Metadata
- Normalize
- Optimize
- Print layout adjustment

---

# 31. SPREADSHEET TOOLS

- XLS/XLSX ↔ CSV
- XLSX ↔ ODS
- CSV ↔ TSV
- sheet selection
- data inspection
- basic normalization
- batch conversion

---

# 32. EBOOK TOOLS

Architecture should support:

- EPUB
- MOBI
- FB2
- CBZ
- other compatible ebook formats

Preserve:

- chapters;
- metadata;
- cover;
- typography;
- structure.

---

# 33. ARCHIVE TOOLS

Support safe:

- create;
- extract;
- inspect;
- convert where meaningful.

Security requirements:

- path traversal protection;
- filename sanitization;
- archive bomb detection;
- memory limits;
- no execution of extracted files.

---

# 34. MEDIA TOOL ARCHITECTURE

LowDoc should be designed so future versions can support:

### Audio

- format conversion;
- bitrate;
- sample rate;
- metadata;
- compression.

### Video

- format;
- resolution;
- bitrate;
- codec;
- compression;
- frame rate.

Heavy media processing must use workers/WASM and aggressive memory management.

---

# 35. CAD / SPECIALIZED FORMAT ARCHITECTURE

Do not exclude specialized formats from the architecture.

Create an extensible engine model for:

- CAD;
- vector graphics;
- GIS;
- scientific data;
- publishing;
- legacy formats.

Only expose a format in the UI after actual implementation/testing.

---

# 36. BATCH PROCESSING

Support:

- multiple files;
- queue;
- progress;
- retry;
- cancel;
- pause where technically possible;
- ZIP output.

Example:

```text
20 files

✓ 12 completed
⟳ 1 processing
○ 6 waiting
✕ 1 failed
```

---

# 37. SMART AUTO

AUTO analyzes:

- format;
- size;
- content;
- compatibility;
- intended use where known.

Example:

```text
proposal.docx

Recommended:
PDF

Reason:
Best for sharing and printing.
```

---

# 38. CONVERSION CONSOLE

Retain the current Console concept.

Turn it into a technical processing inspector.

```text
LOWDOC ENGINE

[12:31:04] Loading file
[12:31:04] Detecting format
[12:31:05] Analyzing page dimensions
[12:31:05] Initializing engine
[12:31:06] Converting
[12:31:07] Validating output
[12:31:07] Complete
```

Do not expose file contents.

---

# 39. FILE COMPATIBILITY DETECTOR

Before conversion:

```text
DOCX

Text       ✓
Images     ✓
Tables     ✓
Fonts      ⚠
SmartArt   ⚠
```

Then:

```text
PDF Export

Compatibility:
High

Potential changes:
Embedded font substitution
```

---

# 40. FILE VALIDATION

Never trust extensions.

Validate using:

- MIME;
- extension;
- magic bytes/signatures;
- parser validation;
- size;
- malformed-file detection.

---

# 41. MEMORY MANAGEMENT

Implement:

- chunking;
- streaming where possible;
- worker isolation;
- WASM cleanup;
- Blob cleanup;
- object URL cleanup;
- concurrency limits.

The UI must never freeze because a large file was selected.

---

# 42. LARGE FILE HANDLING

When the device cannot safely process a file:

```text
This file is too large for safe processing
on this device.

Try:
• closing other tabs;
• reducing the file size;
• splitting the document;
• using a desktop device.
```

Never silently upload the file to a server.

---

# 43. LOCAL HISTORY

Optional.

Store only local metadata:

- filename;
- operation;
- timestamp;
- input size;
- output size.

Use IndexedDB.

No synchronization.

Allow:

- clear history;
- delete item;
- disable history.

---

# 44. FAQ

Create a public FAQ page.

Categories:

### General

- What is LowDoc?
- Is LowDoc free?
- Do I need an account?
- Does LowDoc upload my files?

### Privacy

- Are files stored?
- Does LowDoc use a database?
- Does conversion happen locally?

### Conversion

- Why did formatting change?
- Why is PDF → DOCX difficult?
- What does Limited Fidelity mean?
- What happens when a font is missing?

### Paper

- What is A4?
- What is F4?
- Can I convert A4 to F4?
- Can I use custom paper sizes?

### Technical

- Which browsers are supported?
- Does LowDoc work offline?
- Why is a conversion slow?

FAQ must be static and version-controlled.

---

# 45. SUGGESTION BOX

Create a public suggestion box without login.

User can submit:

- suggestion;
- bug report;
- format request;
- feature request;
- UX feedback.

Required:

- category;
- message.

Optional:

- contact information.

Never require an email.

---

# 46. IMPORTANT NO-DATABASE RULE FOR SUGGESTIONS

The core LowDoc application must not store suggestions in a database.

Therefore:

### Current-session live feedback

After submission:

```text
✓ Suggestion received for this session.
```

It can immediately appear in the current user's UI.

### Persistent public live feed

This cannot exist across different users without some form of shared persistence.

If the project remains strictly zero-database, persistent cross-user suggestions must not be part of the core architecture.

If a future external public feedback system is introduced, it must be explicitly treated as an external integration and must not receive user documents.

---

# 47. DONATION

Create:

# Support LowDoc

LowDoc does not need subscriptions.

Possible options:

- voluntary donation;
- GitHub Sponsors;
- Buy Me a Coffee;
- other external donation provider.

Donation must never require LowDoc login.

Core functionality remains free.

---

# 48. ABOUT LOWDOC

Create an About page explaining:

- what LowDoc is;
- why it exists;
- local-first architecture;
- privacy philosophy;
- technology;
- supported tools;
- limitations;
- project goals;
- open-source information if applicable.

---

# 49. PRIVACY PAGE

Explain:

- no account;
- no document database;
- local processing;
- temporary browser data;
- local history;
- external services if any;
- donation providers;
- analytics policy.

Every statement must match actual implementation.

---

# 50. TERMS / LEGAL

Provide basic:

- Terms of Use;
- Privacy Policy;
- Copyright;
- Third-party licenses;
- Open-source licenses.

Especially important because LowDoc will use external conversion libraries/WASM engines.

---

# 51. THIRD-PARTY LICENSE CENTER

Create a page listing:

- conversion libraries;
- WASM projects;
- fonts;
- icons;
- dependencies;
- licenses.

This is important for a universal conversion platform.

---

# 52. STATUS / DIAGNOSTICS

Create a local diagnostics screen.

Example:

```text
LowDoc Diagnostics

Browser             ✓
Web Workers         ✓
WASM                ✓
IndexedDB           ✓
Service Worker      ✓
File System API     ✓
Memory              Good

PDF Engine          Ready
Image Engine        Ready
Office Engine       Not Loaded
```

No sensitive information should be uploaded.

---

# 53. BROWSER COMPATIBILITY

Test:

- Chrome;
- Edge;
- Firefox;
- Safari;
- Android Chrome;
- iOS Safari.

Feature availability should degrade gracefully.

---

# 54. OFFLINE / PWA

Implement:

- Web App Manifest;
- Service Worker;
- cached application shell;
- lazy engine caching;
- offline status;
- installability.

Never claim "100% offline" until verified.

---

# 55. INTERNATIONALIZATION

Architecture must be ready for:

- English;
- Indonesian;
- other languages later.

Do not hardcode UI strings throughout components.

Use a translation layer.

---

# 56. ACCESSIBILITY

Requirements:

- keyboard navigation;
- semantic HTML;
- ARIA;
- screen-reader labels;
- focus management;
- high contrast;
- reduced motion;
- accessible progress;
- accessible dialogs;
- accessible file picker.

---

# 57. SEO

SEO should target both brand and utility searches.

Brand:

> LowDoc

Long-tail:

> PDF to Word converter

> JPG to WebP converter

> resize image

> compress PDF

> A4 to F4 document

But only create pages for functionality that genuinely exists.

---

# 58. SEO PAGE STRUCTURE

Example:

```text
/
 /convert
 /resize
 /compress
 /pdf-tools
 /image-tools
 /document-tools
 /spreadsheet-tools
 /about
 /faq
 /privacy
 /support
```

Specific tools:

```text
/pdf-tools/merge
/pdf-tools/split
/pdf-tools/compress
/image-tools/resize
/image-tools/compress
/image-tools/png-to-webp
/document-tools/pdf-to-docx
/document-tools/docx-to-pdf
```

---

# 59. STRUCTURED DATA

Where appropriate:

- WebSite;
- SoftwareApplication;
- FAQPage where eligible;
- BreadcrumbList.

Do not create fake structured data.

---

# 60. VERCEL ARCHITECTURE

Vercel is used for:

- hosting;
- static pages;
- Next.js application;
- SEO;
- assets;
- PWA files.

Vercel should NOT become the document-processing backend.

Architecture:

```text
User
 ↓
Vercel
 ↓
Next.js UI
 ↓
Browser
 ↓
Web Worker
 ↓
WASM / Browser Engine
 ↓
Output
```

---

# 61. NO-DATABASE ARCHITECTURE

There is no:

```text
PostgreSQL
MySQL
Supabase
MongoDB
Redis
Firebase
```

for core LowDoc functionality.

Local storage is allowed only for:

- settings;
- optional history;
- cached application data.

---

# 62. SECURITY MODEL

Implement:

- input validation;
- parser isolation;
- worker isolation;
- archive safety;
- memory limits;
- filename sanitization;
- safe downloads;
- object URL cleanup;
- CSP where practical;
- dependency auditing.

Never execute uploaded/extracted files.

---

# 63. TELEMETRY POLICY

Default:

> No document analytics.

Do not collect:

- filenames;
- document contents;
- extracted text;
- document metadata;
- conversion payloads.

If anonymous application telemetry is ever added, it must be explicitly documented and must not expose document information.

---

# 64. UI INFORMATION ARCHITECTURE

Primary navigation:

```text
Home
Convert
Resize
Compress
PDF Tools
Image Tools
Documents
Spreadsheets
More
```

Secondary:

```text
FAQ
About
Privacy
Support
Donate
```

---

# 65. HOMEPAGE

Recommended hierarchy:

```text
LOWDOC

Private file tools.
Built for your browser.

Convert · Resize · Compress · Transform

[ Drop your files here ]

No account
No upload
No database
Local processing
```

Then:

```text
Popular Tools

PDF → DOCX
DOCX → PDF
JPG → WebP
Compress PDF
Resize Image
Merge PDF
```

Then:

```text
Why LowDoc?

Fidelity First
Local Processing
Universal Architecture
Free Core Tools
```

---

# 66. CONVERSION WORKSPACE

Workflow:

```text
Select Files
 ↓
Detect
 ↓
Analyze
 ↓
Choose Action
 ↓
Choose Output
 ↓
Compatibility
 ↓
Options
 ↓
Convert
 ↓
Validate
 ↓
Preview
 ↓
Adjust Paper
 ↓
Save
```

---

# 67. EMPTY STATES

Every tool needs a useful empty state.

Example:

```text
Drop your files here

Supported:
DOCX · PDF · XLSX · PNG · JPG ...

or Browse files
```

---

# 68. SUCCESS STATE

```text
Conversion Complete

✓ Output generated
✓ Fidelity checked
✓ Preview available

[ Preview ]
[ Download ]
[ Download All ]
```

---

# 69. FAILURE STATE

```text
Conversion could not be completed.

Reason:
Unsupported document feature.

[ Retry ]
[ Choose Another Format ]
[ View Details ]
```

---

# 70. PRODUCT QUALITY RULE

Never add a format merely to increase the format count.

A format should only be marked:

> Supported

after passing real conversion tests.

---

# 71. TESTING SYSTEM

Create fixture datasets for each supported format.

Test:

- normal files;
- large files;
- malformed files;
- multilingual documents;
- tables;
- images;
- fonts;
- headers;
- footers;
- page breaks;
- custom page sizes;
- landscape;
- portrait.

---

# 72. FIDELITY TESTING

For each conversion:

Compare:

- page count;
- page dimensions;
- text;
- positions;
- fonts;
- images;
- tables;
- margins;
- colors;
- links;
- headers;
- footers.

Where possible, render both source and result and perform visual comparison.

---

# 73. PERFORMANCE TARGETS

The app should:

- load UI quickly;
- lazy-load heavy engines;
- keep main thread responsive;
- limit worker concurrency;
- clean memory;
- avoid loading unnecessary formats.

---

# 74. ROADMAP

## PHASE 0 — Existing Project Audit

- inspect repository;
- inspect existing LowDoc;
- identify reusable code;
- identify current conversion engines;
- identify technical limitations.

---

## PHASE 1 — Architecture Foundation

- format registry;
- capability registry;
- conversion graph;
- engine adapter;
- workers;
- file validation.

---

## PHASE 2 — Fidelity Foundation

- document analyzer;
- page-size detection;
- orientation;
- margins;
- fonts;
- structure;
- fidelity validation.

---

## PHASE 3 — Universal Converter

- conversion UI;
- AUTO;
- batch;
- queue;
- compatibility;
- errors;
- downloads.

---

## PHASE 4 — Preview + Paper Engine

- document renderer;
- preview;
- zoom;
- page navigation;
- paper selector;
- A/B/C series;
- F4;
- Letter;
- Legal;
- custom size;
- orientation;
- layout modes;
- save selected size.

---

## PHASE 5 — Resize + Compression

- image resize;
- file-size optimization;
- target size;
- compression;
- metadata.

---

## PHASE 6 — PDF Toolkit

- merge;
- split;
- extract;
- reorder;
- rotate;
- compress;
- PDF/image transformations.

---

## PHASE 7 — Image Toolkit

- image conversion;
- resize;
- crop;
- compress;
- optimize;
- batch.

---

## PHASE 8 — Documents + Data

- office;
- spreadsheet;
- text;
- ebook;
- structured data.

---

## PHASE 9 — Advanced Formats

Expand into:

- archive;
- audio;
- video;
- CAD;
- graphics;
- scientific;
- legacy formats.

Only when reliable browser-side engines are available.

---

## PHASE 10 — PWA

- offline;
- service worker;
- engine caching;
- installable app.

---

## PHASE 11 — Public Product

- FAQ;
- About;
- Privacy;
- Terms;
- Support;
- Donation;
- Suggestion system;
- license center.

---

## PHASE 12 — SEO + Discovery

- metadata;
- sitemap;
- robots;
- structured data;
- tool landing pages;
- Google Search Console.

---

# 75. FINAL LOWDOC FEATURE MAP

```text
LOWDOC
│
├── CONVERT
│   ├── Documents
│   ├── Spreadsheets
│   ├── Presentations
│   ├── PDF
│   ├── Images
│   ├── Ebooks
│   ├── Archives
│   ├── Audio
│   ├── Video
│   ├── Data
│   └── Specialized Formats
│
├── RESIZE
│   ├── File Size
│   ├── Images
│   ├── Documents
│   ├── Media
│   └── Custom
│
├── COMPRESS
│   ├── PDF
│   ├── Images
│   ├── Documents
│   ├── Media
│   └── Archives
│
├── PDF TOOLS
│
├── IMAGE TOOLS
│
├── DOCUMENT TOOLS
│
├── SPREADSHEET TOOLS
│
├── EBOOK TOOLS
│
├── ARCHIVE TOOLS
│
├── PREVIEW
│   ├── Zoom
│   ├── Paper Size
│   ├── Orientation
│   ├── Side-by-Side
│   ├── Overlay
│   └── Fidelity Report
│
├── LOCAL
│   ├── History
│   ├── Settings
│   └── Offline
│
└── ABOUT
    ├── FAQ
    ├── Privacy
    ├── Terms
    ├── Licenses
    ├── Support
    ├── Donate
    └── Suggestions
```

---

# 76. OPEN CODE MASTER PROMPT

## ROLE

You are the lead senior software architect and engineer responsible for transforming the existing LowDoc repository into the final LowDoc product described in this document.

You must think like:

- senior frontend engineer;
- WASM engineer;
- document-processing engineer;
- UX engineer;
- performance engineer;
- security engineer;
- accessibility engineer;
- product architect.

Do not blindly implement features.

Prioritize correctness and reliability.

---

## ABSOLUTE CONSTRAINTS

NEVER introduce:

- authentication;
- user accounts;
- database;
- cloud document storage;
- mandatory document upload;
- paid conversion APIs;
- server-side document processing;
- subscription limits.

The browser must remain the primary processing environment whenever technically possible.

---

## FIRST ACTION

Audit the existing repository.

Do not immediately rewrite.

Determine:

- what already works;
- what is incomplete;
- what can be reused;
- what should be refactored;
- what should be replaced.

---

## CORE ARCHITECTURE

Build around:

```text
Format Registry
        ↓
Capability Graph
        ↓
Engine Adapter
        ↓
Worker
        ↓
WASM / Browser Engine
        ↓
Fidelity Validator
        ↓
Preview
        ↓
Download
```

---

## FIDELITY-FIRST REQUIREMENT

Every document conversion must attempt to preserve:

- page size;
- orientation;
- margins;
- text;
- fonts;
- spacing;
- tables;
- images;
- headers;
- footers;
- page breaks;
- colors;
- links;
- structure.

If preservation cannot be guaranteed:

- mark conversion appropriately;
- display limitations;
- show warnings;
- never falsely claim perfect fidelity.

---

## PAPER ENGINE

Implement a central paper-size registry supporting:

- A0-A10;
- B0-B10;
- C0-C10;
- Letter;
- Legal;
- Tabloid;
- Ledger;
- Executive;
- Statement;
- Folio;
- F4;
- Quarto;
- Custom.

Paper selection must be searchable.

---

## DOCUMENT ANALYSIS

Before conversion, detect:

- page dimensions;
- paper size;
- orientation;
- margins;
- fonts;
- page count;
- images;
- tables;
- document structure.

Preserve the detected properties as transformation constraints.

---

## PREVIEW

After conversion:

- render output;
- allow zoom;
- allow page navigation;
- allow paper-size switching;
- show original vs converted;
- show fidelity warnings.

Changing paper size must generate a real output with that page size when the user saves.

---

## FIDELITY VALIDATION

Build a validator capable of comparing:

- page dimensions;
- page count;
- text;
- layout;
- images;
- tables;
- fonts;
- margins;
- structural properties.

Where technically feasible, perform visual comparison.

---

## UNIVERSAL FORMAT SYSTEM

Never hardcode conversion pairs directly into UI.

Use registries and adapters.

Every format must declare:

- identity;
- MIME;
- extensions;
- category;
- capabilities;
- engine;
- limitations.

Every conversion pair must declare:

- supported;
- high fidelity;
- limited;
- experimental;
- lossy;
- unsupported;
- invalid.

---

## WORKERS

Heavy processing must run outside the main thread.

Implement:

- progress;
- cancellation;
- errors;
- cleanup;
- concurrency control.

---

## RESIZE

Implement distinct resize semantics:

- image dimensions;
- document paper size;
- file size;
- media resolution;
- compression.

Do not conflate them.

---

## BATCH

Implement:

- multiple files;
- queue;
- retry;
- cancel;
- progress;
- ZIP output.

---

## PRIVACY

Do not send:

- filenames;
- file contents;
- extracted text;
- document metadata

to external services.

Do not store documents remotely.

---

## LOCAL STORAGE

IndexedDB may only be used for:

- settings;
- optional metadata history;
- cached local application state.

Never make it a cloud substitute.

---

## FAQ

Create static FAQ.

Include:

- product;
- privacy;
- conversion;
- fidelity;
- paper size;
- offline;
- browser compatibility.

---

## SUGGESTIONS

Implement a no-login suggestion interface.

Do not introduce a database merely to make suggestions persistent.

Current-session feedback may be shown immediately.

Persistent cross-user public suggestions require an explicitly approved external persistence mechanism and must remain outside the core zero-database architecture.

---

## DONATION

Provide a static donation/support page.

Do not introduce LowDoc accounts.

---

## ABOUT / PRIVACY / TERMS / LICENSES

Implement all public informational pages.

Document third-party licenses.

---

## SEO

Implement:

- metadata;
- canonical;
- sitemap;
- robots;
- Open Graph;
- structured data;
- useful tool pages.

---

## PWA

Implement progressively:

- manifest;
- service worker;
- app shell;
- engine caching;
- offline status.

Never falsely advertise offline support.

---

## SECURITY

Implement:

- file validation;
- magic-byte checks;
- parser isolation;
- archive safety;
- memory limits;
- filename sanitization;
- safe downloads;
- CSP;
- dependency auditing.

---

## ACCESSIBILITY

Implement:

- keyboard support;
- screen readers;
- focus management;
- ARIA;
- semantic HTML;
- contrast;
- reduced motion.

---

## MOBILE

Optimize specifically for:

- Android;
- iOS;
- touch interaction;
- mobile file selection;
- mobile preview;
- downloads/sharing.

---

## TESTING

Create:

- unit tests;
- integration tests;
- worker tests;
- conversion fixture tests;
- fidelity tests;
- malformed-file tests;
- large-file tests;
- browser tests.

Never mark a format as supported without a test.

---

## DEVELOPMENT ORDER

Follow this order:

1. Audit
2. Architecture
3. Format registry
4. Capability graph
5. Engine adapters
6. Workers
7. File validation
8. Fidelity analyzer
9. Converter
10. Preview
11. Paper engine
12. Resize
13. Compression
14. Batch
15. PDF tools
16. Image tools
17. Document/data tools
18. Advanced formats
19. PWA
20. Accessibility
21. SEO
22. FAQ/About/Privacy/Support
23. Testing
24. Performance audit
25. Security audit
26. Final UX polish

---

# FINAL DEFINITION OF DONE

LowDoc is not complete merely because files can be converted.

It is complete when:

- conversion works;
- output fidelity is validated;
- original page size is detected;
- paper sizes can be selected;
- preview works;
- saved output uses selected paper size;
- resize works;
- compression works;
- batch processing works;
- common formats are reliable;
- unsupported formats are honest;
- errors are understandable;
- processing does not freeze the UI;
- no login exists;
- no database exists;
- documents are not uploaded for normal processing;
- privacy claims match implementation;
- mobile works;
- accessibility works;
- PWA works where supported;
- SEO is implemented;
- FAQ exists;
- About exists;
- Privacy exists;
- Terms exist;
- Licenses exist;
- Support/Donation exists;
- Suggestions exist without violating the zero-database architecture.

---

# LOWDOC FINAL PRODUCT IDENTITY

## LowDoc

### Private file tools. Built for your browser.

**Convert. Resize. Compress. Preview. Preserve.**

No account.

No database.

No mandatory upload.

No artificial limits.

Just your files and your browser.

---

# FINAL PRODUCT PHILOSOPHY

LowDoc should never become obsessed with saying:

> "We support the most formats."

Instead, LowDoc should become known for:

> **"When I convert a file with LowDoc, I trust the result."**

That is the product's ultimate goal.

The format ecosystem can grow indefinitely.

The engine architecture can grow indefinitely.

The tools can grow indefinitely.

But the central promise must never change:

# **LOWDOC PRESERVES WHAT MATTERS.**