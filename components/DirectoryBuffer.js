import path from "node:path";

import { Component, IP } from "@noflo/noflo";

/**
 * Collects file paths to a per-directory buffer until the directory is
 * released. Group trails observed on the collect stream are re-applied
 * around released packets. Instance-level state (as in 1.x).
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    icon: "folder",
    description: "Collect file paths to a buffer until released",
    inPorts: {
      collect: {
        datatype: "string",
        description: "File paths to collect",
      },
      release: {
        datatype: "string",
        description: "Directory to release",
      },
    },
    outPorts: {
      out: { datatype: "string" },
    },
  });

  /** @type {Record<string, { data: unknown, groups: unknown[] }[]>} */
  const buffers = {};
  /** @type {string[]} */
  const released = [];
  c.tearDown = async () => {
    for (const key of Object.keys(buffers)) {
      delete buffers[key];
    }
    released.length = 0;
  };

  c.process((input, output) => {
    /**
     * @param {{ data: unknown, groups: unknown[] }} packet
     */
    const releasePacket = (packet) => {
      for (const group of packet.groups) {
        output.send({ out: new IP("openBracket", group) });
      }
      output.send({ out: new IP("data", packet.data) });
      for (const group of packet.groups) {
        output.send({ out: new IP("closeBracket", group) });
      }
    };

    if (input.hasData("release")) {
      // Releasing a directory
      const release = input.getData("release");
      if (released.includes(release)) {
        // Already released, skip
        output.done();
        return;
      }
      released.push(release);
      if (!buffers[release]) {
        output.done();
        return;
      }
      for (const packet of buffers[release]) {
        releasePacket(packet);
      }
      delete buffers[release];
      output.done();
      return;
    }

    if (!input.hasStream("collect")) {
      return;
    }
    const stream = /** @type {import("@noflo/noflo").IP[]} */ (
      input.getStream("collect")
    );
    /** @type {unknown[]} */
    const groups = [];
    for (const ip of stream) {
      if (ip.type === "openBracket") {
        groups.push(ip.data);
        continue;
      }
      if (ip.type === "data") {
        const packet = {
          data: ip.data,
          groups: groups.slice(0),
        };
        const directory = path.dirname(String(ip.data));
        if (released.includes(directory)) {
          // Already released
          releasePacket(packet);
          continue;
        }
        // Add to buffer
        if (!buffers[directory]) {
          buffers[directory] = [];
        }
        buffers[directory].push(packet);
        continue;
      }
      if (ip.type === "closeBracket") {
        groups.pop();
      }
    }
    output.done();
  });

  return c;
}
