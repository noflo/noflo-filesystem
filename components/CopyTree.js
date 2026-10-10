import fs from "node:fs";

import { Component } from "@noflo/noflo";

/**
 * Copies a directory tree recursively, using the Node.js built-in
 * `fs.cp` instead of the unmaintained `fs.extra` package.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    icon: "copy",
    description: "Copy a directory tree",
    // The 1.x source set a lowercase `forwardbrackets`, which the engine
    // never read; the effective behavior was no bracket forwarding
    forwardBrackets: {},
    inPorts: {
      from: {
        datatype: "string",
        description: "Source path",
        required: true,
      },
      to: {
        datatype: "string",
        description: "Target path",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "string" },
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("from", "to")) {
      return;
    }
    const [from, to] = input.getData("from", "to");
    fs.cp(from, to, { recursive: true }, (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: to });
    });
  });

  return c;
}
