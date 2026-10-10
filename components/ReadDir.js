import fs from "node:fs";
import path from "node:path";

import { Component, IP } from "@noflo/noflo";

/**
 * Lists file paths inside a directory (sorted), grouped under the
 * directory path.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    icon: "folder-open",
    description: "Get a list of file paths inside a directory",
    inPorts: {
      source: {
        datatype: "string",
        description: "Directory path to read",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "string" },
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("source")) {
      return;
    }
    const dirPath = input.getData("source");
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        output.done(err);
        return;
      }
      const sortedFiles = files.sort();
      output.send({ out: new IP("openBracket", dirPath) });
      for (const file of sortedFiles) {
        output.send({ out: path.join(dirPath, file) });
      }
      output.sendDone({ out: new IP("closeBracket", dirPath) });
    });
  });

  return c;
}
