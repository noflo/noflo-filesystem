import fs from "node:fs";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "trash",
    description: "Remove a file",
    inPorts: {
      in: {
        datatype: "string",
        description: "File path to remove",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "string" },
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const path = input.getData("in");
    fs.unlink(path, (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: path });
    });
  });

  return c;
}
