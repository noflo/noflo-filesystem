import fs from "node:fs";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "floppy-o",
    description: "Write a buffer into a file",
    inPorts: {
      in: {
        datatype: "buffer",
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
    const [filename, buffer] = input.getData("filename", "in");
    fs.writeFile(filename, buffer, (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: filename });
    });
  });

  return c;
}
