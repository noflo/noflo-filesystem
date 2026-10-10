# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [2.0.0-alpha.1] - 2026-10-09

### Added

- The package is renamed to `@noflo/filesystem`; graph component identifiers are unaffected and keep resolving under the `filesystem/` namespace

### Changed

- All 21 components are converted to JavaScript ES modules for NoFlo 2.x (esm-only), with TypeScript-checked sources and Biome formatting
- Components follow the 2.x Process API contract: preconditions are checked with `has`/`hasData` before any `get`/`getData` call
- `CopyTree` uses the Node.js built-in `fs.cp` with `recursive: true` instead of the unmaintained `fs.extra` package, which is dropped
- `CopyFile` keeps its stream-based copy; `MakeDir` keeps its recursive parent-creating algorithm; `ReadFileRaw` keeps its chunked raw read
- `WriteFile` sends the written file path on `out`, fixing the 1.x bug where the content string was dereferenced for `.filename` and `undefined` was sent
- The MIME components keep the `mimetype` package (unmaintained but working); a maintained replacement may be evaluated separately
- The `mimetype` module is typed through a local ambient declaration (`types/mimetype.d.ts`)
- `MimeRouter`/`MimeDocumentRouter` send their routed IP via an assigned `index`, with the IP options typing gap worked around by assigning the index on the instance

### Fixed

- Test suite rebuilt on `node:test` (27 tests with tmpdir fixtures) covering all 21 components, replacing the nodeunit-style suite that covered 11
