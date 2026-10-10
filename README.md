# @noflo/filesystem

Filesystem Utilities for [NoFlo](http://noflojs.org/)

This package provides components for working with the filesystem in
NoFlo programs: reading and writing files, listing and copying
directories, path manipulation, and MIME-type routing.

## Usage

Install the package:

    npm install @noflo/filesystem

The components are then available under the `filesystem/` namespace,
for example `filesystem/ReadFile` or `filesystem/WriteFile`.

Components include:

- `ReadFile`, `WriteFile`, `ReadFileRaw`, `WriteFileRaw` — file content
- `ReadDir`, `MakeDir`, `CopyFile`, `CopyTree`, `Unlink`, `Stat` —
  directory and file operations
- `BaseName`, `DirName`, `ExtName`, `JoinPath`, `Normalize`, `Resolve` —
  path manipulation
- `PathToMime`, `MimeRouter`, `MimeDocumentRouter` — MIME routing
- `DirectoryBuffer`, `DirectoryGroupBuffer` — collect paths until a
  directory is released
