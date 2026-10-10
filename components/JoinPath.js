import path from "node:path";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    description: "Join a directory path with a file path",
    // The 1.x source set a lowercase `forwardbrackets`, which the engine
    // never read; with port names other than `in` the effective behavior
    // was no bracket forwarding
    forwardBrackets: {},
    inPorts: {
      directory: {
        datatype: "string",
        description: "Directory path",
        required: true,
      },
      file: {
        datatype: "string",
        description: "File path",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "string" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("directory", "file")) {
      return;
    }
    const [directory, file] = input.getData("directory", "file");
    output.sendDone({ out: path.join(directory, file) });
  });

  return c;
}
