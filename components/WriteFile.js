import fs from "node:fs";

import { Component } from "@noflo/noflo";

/**
 * Writes a string into a file. Fixes the 1.x bug where `undefined` was
 * sent on `out` (the content string was dereferenced for `.filename`
 * instead of using the file path).
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    icon: "floppy-o",
    description: "Write a string into a file",
    inPorts: {
      in: {
        datatype: "string",
        description: "Contents to write",
        required: true,
      },
      filename: {
        datatype: "string",
        description: "File path to write to",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "string" },
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in", "filename")) {
      return;
    }
    const [filename, data] = input.getData("filename", "in");
    fs.writeFile(filename, data, "utf-8", (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: filename });
    });
  });

  return c;
}
