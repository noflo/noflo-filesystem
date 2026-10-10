import path from "node:path";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "folder",
    description: "Get the directory path of a file path",
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
    output.sendDone({ out: path.dirname(input.getData("in")) });
  });

  return c;
}
