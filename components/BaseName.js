import path from "node:path";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "file",
    description: "Get the base name of the file",
    inPorts: {
      in: {
        datatype: "string",
        description: "File path",
        required: true,
      },
      ext: {
        datatype: "string",
        description: "Extension, if any",
        control: true,
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
    let ext = "";
    if (input.hasData("ext")) {
      ext = input.getData("ext");
    }
    const data = input.getData("in");
    output.sendDone({ out: path.basename(data, ext) });
  });

  return c;
}
