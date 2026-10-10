import fs from "node:fs";

import { Component, IP } from "@noflo/noflo";

/**
 * Reads a file and sends the contents grouped under the file path.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Read a file and send it out as a string",
    inPorts: {
      in: {
        datatype: "string",
        description: "Source file path",
        required: true,
      },
      encoding: {
        datatype: "string",
        description: "File encoding",
        default: "utf-8",
        control: true,
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
    const fileName = input.getData("in");
    const encoding = input.getData("encoding");
    fs.readFile(fileName, encoding, (err, data) => {
      if (err) {
        output.done(err);
        return;
      }
      output.send({ out: new IP("openBracket", fileName) });
      output.send({ out: data });
      output.sendDone({ out: new IP("closeBracket", fileName) });
    });
  });

  return c;
}
