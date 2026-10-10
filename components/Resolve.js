import path from "node:path";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "font",
    description: "Resolve a relative path to an absolute one",
    inPorts: {
      in: {
        datatype: "string",
        description: "Path to resolve",
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
    const data = input.getData("in");
    output.sendDone({ out: path.resolve(data) });
  });

  return c;
}
