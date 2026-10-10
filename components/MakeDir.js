import fs from "node:fs";
import path from "node:path";

import { Component } from "@noflo/noflo";

/**
 * Creates a directory, creating missing parents as needed. Succeeds
 * when the directory already exists.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    icon: "folder",
    description: "Create a directory",
    inPorts: {
      in: {
        datatype: "string",
        description: "Directory path to create",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "string" },
      error: { datatype: "object" },
    },
  });

  /**
   * @param {string} dir
   * @param {(err: Error | null) => void} callback
   * @returns {void}
   */
  const mkdir = (dir, callback) => {
    const dirPath = path.resolve(dir);

    // Try creating it
    fs.mkdir(dirPath, (err) => {
      // Directory was created
      if (!err) {
        callback(null);
        return;
      }

      if (err.code === "ENOENT") {
        // Parent missing, create
        mkdir(path.dirname(dirPath), (internalError) => {
          if (internalError) {
            callback(internalError);
            return;
          }
          mkdir(dirPath, callback);
        });
        return;
      }
      // Check if the directory actually exists already
      fs.stat(dirPath, (statErr, stat) => {
        if (statErr) {
          callback(err);
          return;
        }
        if (!stat.isDirectory()) {
          callback(new Error(`${dirPath} is not a directory`));
          return;
        }
        callback(null);
      });
    });
  };

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const dirPath = input.getData("in");
    mkdir(dirPath, (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: dirPath });
    });
  });

  return c;
}
