import fs from "node:fs";

import { Component, IP } from "@noflo/noflo";

/**
 * Reads a file as raw buffer chunks, grouped under the file path.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Read a file and send it out as a buffer",
    inPorts: {
      in: {
        datatype: "string",
        description: "Source file path",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "buffer" },
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const filename = input.getData("in");
    fs.open(filename, "r", (err, fd) => {
      if (err) {
        output.done(err);
        return;
      }

      fs.fstat(fd, (statErr, stats) => {
        if (statErr) {
          output.done(statErr);
          return;
        }

        const buffer = Buffer.alloc(stats.size);
        output.send({ out: new IP("openBracket", filename) });
        const readChunk = (/** @type {number} */ pos) => {
          fs.read(fd, buffer, 0, buffer.length, pos, (readErr, bytes, buf) => {
            if (readErr) {
              output.done(readErr);
              return;
            }
            output.send({ out: buf.slice(0, bytes) });
            const position = pos + buf.length;
            if (position >= stats.size) {
              output.sendDone({ out: new IP("closeBracket") });
              return;
            }
            readChunk(position);
          });
        };
        readChunk(0);
      });
    });
  });

  return c;
}
