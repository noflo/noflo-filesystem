import path from "node:path";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "file",
    description: "Get the file extension for a file path",
    inPorts: {
      in: {
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
    if (!input.hasData("in")) {
      return;
    }
    output.sendDone({ out: path.extname(input.getData("in")) });
  });

  return c;
}
