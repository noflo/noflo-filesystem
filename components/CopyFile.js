import fs from "node:fs";

import { Component } from "@noflo/noflo";

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "copy",
    description: "Copy a file",
    // The 1.x source set a lowercase `forwardbrackets`, which the engine
    // never read; the effective behavior was no bracket forwarding
    forwardBrackets: {},
    inPorts: {
      source: { datatype: "string", required: true },
      destination: { datatype: "string", required: true },
    },
    outPorts: {
      out: { datatype: "string" },
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("source", "destination")) {
      return;
    }
    const [source, destination] = input.getData("source", "destination");
    const rs = fs.createReadStream(source);
    const ws = fs.createWriteStream(destination);
    rs.on("error", (err) => output.done(err));
    ws.on("error", (err) => output.done(err));

    rs.pipe(ws);
    rs.on("end", () => output.sendDone({ out: destination }));
  });

  return c;
}
