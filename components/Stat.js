import fs from "node:fs";

import { Component, IP } from "@noflo/noflo";

/**
 * Reads fs.Stats for a path and sends it as a plain object (with the
 * path attached and the boolean predicate methods inlined as values,
 * since class methods do not survive object transmission), grouped
 * under the path.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description:
      "Read stats of a file or directory and send them out with the path",
    inPorts: {
      in: {
        datatype: "string",
        description: "Path to inspect",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "object" },
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const path = input.getData("in");
    fs.stat(path, (err, stats) => {
      if (err) {
        output.done(err);
        return;
      }
      const statObject = /** @type {Record<string, any>} */ (
        /** @type {unknown} */ ({ ...stats, path })
      );
      const methods = [
        "isFile",
        "isDirectory",
        "isBlockDevice",
        "isCharacterDevice",
        "isFIFO",
        "isSocket",
      ];
      for (const func of methods) {
        statObject[func] = /** @type {any} */ (stats)[func]();
      }
      output.send({ out: new IP("openBracket", path) });
      output.send({ out: statObject });
      output.sendDone({ out: new IP("closeBracket", path) });
    });
  });

  return c;
}
