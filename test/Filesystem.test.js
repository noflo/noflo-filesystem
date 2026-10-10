import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import * as noflo from "@noflo/noflo";

import { getComponent as getBaseName } from "../components/BaseName.js";
import { getComponent as getCopyFile } from "../components/CopyFile.js";
import { getComponent as getCopyTree } from "../components/CopyTree.js";
import { getComponent as getDirectoryBuffer } from "../components/DirectoryBuffer.js";
import { getComponent as getDirectoryGroupBuffer } from "../components/DirectoryGroupBuffer.js";
import { getComponent as getDirName } from "../components/DirName.js";
import { getComponent as getExtName } from "../components/ExtName.js";
import { getComponent as getJoinPath } from "../components/JoinPath.js";
import { getComponent as getMakeDir } from "../components/MakeDir.js";
import { getComponent as getMimeDocumentRouter } from "../components/MimeDocumentRouter.js";
import { getComponent as getMimeRouter } from "../components/MimeRouter.js";
import { getComponent as getNormalize } from "../components/Normalize.js";
import { getComponent as getPathToMime } from "../components/PathToMime.js";
import { getComponent as getReadDir } from "../components/ReadDir.js";
import { getComponent as getReadFile } from "../components/ReadFile.js";
import { getComponent as getReadFileRaw } from "../components/ReadFileRaw.js";
import { getComponent as getResolve } from "../components/Resolve.js";
import { getComponent as getStat } from "../components/Stat.js";
import { getComponent as getUnlink } from "../components/Unlink.js";
import { getComponent as getWriteFile } from "../components/WriteFile.js";
import { getComponent as getWriteFileRaw } from "../components/WriteFileRaw.js";
import { collect, render, waitStream } from "./helpers.js";

/**
 * Wires one in-port and one out-port, plus an error collector.
 * @param {import("@noflo/noflo").Component} component
 * @param {string} inPort
 * @param {string} outPort
 */
const wire = (component, inPort, outPort) => {
  const inSocket = noflo.internalSocket.createSocket();
  const outSocket = noflo.internalSocket.createSocket();
  const errorSocket = noflo.internalSocket.createSocket();
  component.inPorts[inPort].attach(inSocket);
  component.outPorts[outPort].attach(outSocket);
  component.outPorts.error?.attach(errorSocket);
  return {
    inSocket,
    outSocket,
    errorSocket,
    outIps: collect(outSocket),
    errorIps: collect(errorSocket),
  };
};

let tmp = "";

before(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "noflo-filesystem-"));
  fs.writeFileSync(path.join(tmp, "hello.txt"), "Hello Filesystem\n");
  fs.writeFileSync(path.join(tmp, "data.bin"), Buffer.from([1, 2, 3, 4]));
  fs.mkdirSync(path.join(tmp, "nested", "deep"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "nested", "file.txt"), "Nested");
  fs.writeFileSync(path.join(tmp, "nested", "deep", "leaf.txt"), "Leaf");
});

after(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe("Path utilities", () => {
  it("BaseName strips the directory and extension", () => {
    const c = getBaseName();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", "/tmp/some/file.txt"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["file.txt"],
    );
  });

  it("BaseName honors the ext control", () => {
    const c = getBaseName();
    const extSocket = noflo.internalSocket.createSocket();
    c.inPorts.ext.attach(extSocket);
    const { inSocket, outIps } = wire(c, "in", "out");
    extSocket.post(new noflo.IP("data", ".txt"));
    inSocket.post(new noflo.IP("data", "/tmp/some/file.txt"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["file"],
    );
  });

  it("DirName returns the directory part", () => {
    const c = getDirName();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", "/tmp/some/file.txt"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["/tmp/some"],
    );
  });

  it("ExtName returns the extension", () => {
    const c = getExtName();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", "/tmp/file.txt"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      [".txt"],
    );
  });

  it("JoinPath combines directory and file", () => {
    const c = getJoinPath();
    const { inSocket, outIps } = wire(c, "file", "out");
    const dirSocket = noflo.internalSocket.createSocket();
    c.inPorts.directory.attach(dirSocket);
    dirSocket.post(new noflo.IP("data", "/tmp/some"));
    inSocket.post(new noflo.IP("data", "file.txt"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["/tmp/some/file.txt"],
    );
  });

  it("Normalize normalizes the path", () => {
    const c = getNormalize();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", "/tmp/./some//file.txt"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["/tmp/some/file.txt"],
    );
  });

  it("Resolve makes the path absolute", () => {
    const c = getResolve();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", "some/relative.txt"));
    const result = /** @type {string} */ (
      outIps.find((ip) => ip.type === "data")?.data
    );
    assert.equal(path.isAbsolute(result), true);
    assert.ok(result.endsWith("some/relative.txt"));
  });
});

describe("File content components", () => {
  it("ReadFile sends the contents grouped under the path", async () => {
    const c = getReadFile();
    const { inSocket, outIps } = wire(c, "in", "out");
    // Port defaults are delivered by a network's default pass; bare
    // usage sends the control explicitly
    const encodingSocket = noflo.internalSocket.createSocket();
    c.inPorts.encoding.attach(encodingSocket);
    encodingSocket.post(new noflo.IP("data", "utf-8"));
    inSocket.post(new noflo.IP("data", path.join(tmp, "hello.txt")));
    await waitStream(outIps, (ips) => ips.length >= 3);
    assert.deepEqual(render(outIps), [
      `< ${path.join(tmp, "hello.txt")}`,
      'DATA "Hello Filesystem\\n"',
      ">",
    ]);
  });

  it("ReadFile reports ENOENT on the error port", async () => {
    const c = getReadFile();
    const { inSocket, errorIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", path.join(tmp, "doesnotexist")));
    await waitStream(errorIps, (ips) => ips.length > 0);
    assert.equal(/** @type {any} */ (errorIps[0].data).code, "ENOENT");
  });

  it("WriteFile writes contents and reports the path", async () => {
    const c = getWriteFile();
    const { inSocket, outIps } = wire(c, "in", "out");
    const target = path.join(tmp, "written.txt");
    const filenameSocket = noflo.internalSocket.createSocket();
    c.inPorts.filename.attach(filenameSocket);
    filenameSocket.post(new noflo.IP("data", target));
    inSocket.post(new noflo.IP("data", "Written via NoFlo"));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.equal(fs.readFileSync(target, "utf-8"), "Written via NoFlo");
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      [target],
    );
  });

  it("ReadFileRaw sends buffer chunks grouped under the path", async () => {
    const c = getReadFileRaw();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", path.join(tmp, "data.bin")));
    await waitStream(outIps, (ips) => ips.length >= 3);
    const dataIps = outIps.filter((ip) => ip.type === "data");
    assert.equal(dataIps.length, 1);
    assert.deepEqual(
      Buffer.concat(dataIps.map((ip) => /** @type {Buffer} */ (ip.data))),
      Buffer.from([1, 2, 3, 4]),
    );
  });

  it("WriteFileRaw writes the buffer", async () => {
    const c = getWriteFileRaw();
    const { inSocket, outIps } = wire(c, "in", "out");
    const target = path.join(tmp, "raw.bin");
    const filenameSocket = noflo.internalSocket.createSocket();
    c.inPorts.filename.attach(filenameSocket);
    filenameSocket.post(new noflo.IP("data", target));
    inSocket.post(new noflo.IP("data", Buffer.from([9, 8, 7])));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.deepEqual(fs.readFileSync(target), Buffer.from([9, 8, 7]));
  });
});

describe("Directory components", () => {
  it("ReadDir lists directory contents grouped under the path", async () => {
    const c = getReadDir();
    const { inSocket, outIps } = wire(c, "source", "out");
    // A dedicated directory: earlier tests add files to the tmp root
    const listing = path.join(tmp, "listing");
    fs.mkdirSync(listing);
    fs.writeFileSync(path.join(listing, "b.txt"), "b");
    fs.writeFileSync(path.join(listing, "a.txt"), "a");
    inSocket.post(new noflo.IP("data", listing));
    await waitStream(outIps, (ips) => ips.length >= 3);
    assert.deepEqual(render(outIps), [
      `< ${listing}`,
      `DATA ${JSON.stringify(path.join(listing, "a.txt"))}`,
      `DATA ${JSON.stringify(path.join(listing, "b.txt"))}`,
      ">",
    ]);
  });

  it("MakeDir creates nested directories", async () => {
    const c = getMakeDir();
    const { inSocket, outIps } = wire(c, "in", "out");
    const target = path.join(tmp, "made", "deeper", "dirs");
    inSocket.post(new noflo.IP("data", target));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.equal(fs.statSync(target).isDirectory(), true);
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      [target],
    );
  });

  it("MakeDir succeeds when the directory already exists", async () => {
    const c = getMakeDir();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", tmp));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      [tmp],
    );
  });

  it("CopyFile copies a file", async () => {
    const c = getCopyFile();
    const { inSocket, outIps } = wire(c, "source", "out");
    const destination = path.join(tmp, "copied.txt");
    const sourceSocket = noflo.internalSocket.createSocket();
    c.inPorts.source.attach(sourceSocket);
    const destinationSocket = noflo.internalSocket.createSocket();
    c.inPorts.destination.attach(destinationSocket);
    sourceSocket.post(new noflo.IP("data", path.join(tmp, "hello.txt")));
    destinationSocket.post(new noflo.IP("data", destination));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.equal(fs.readFileSync(destination, "utf-8"), "Hello Filesystem\n");
  });

  it("CopyTree copies a directory tree recursively", async () => {
    const c = getCopyTree();
    const { inSocket, outIps } = wire(c, "from", "out");
    const to = path.join(tmp, "tree-copy");
    const toSocket = noflo.internalSocket.createSocket();
    c.inPorts.to.attach(toSocket);
    inSocket.post(new noflo.IP("data", path.join(tmp, "nested")));
    toSocket.post(new noflo.IP("data", to));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.equal(fs.readFileSync(path.join(to, "file.txt"), "utf-8"), "Nested");
    assert.equal(
      fs.readFileSync(path.join(to, "deep", "leaf.txt"), "utf-8"),
      "Leaf",
    );
  });

  it("Unlink removes a file", async () => {
    const c = getUnlink();
    const { inSocket, outIps } = wire(c, "in", "out");
    const victim = path.join(tmp, "victim.txt");
    fs.writeFileSync(victim, "bye");
    inSocket.post(new noflo.IP("data", victim));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.equal(fs.existsSync(victim), false);
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      [victim],
    );
  });

  it("Unlink reports ENOENT for missing paths", async () => {
    const c = getUnlink();
    const { inSocket, errorIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", path.join(tmp, "doesnotexist")));
    await waitStream(errorIps, (ips) => ips.length > 0);
    assert.equal(/** @type {any} */ (errorIps[0].data).code, "ENOENT");
  });

  it("Stat sends the stats object grouped under the path", async () => {
    const c = getStat();
    const { inSocket, outIps } = wire(c, "in", "out");
    const target = path.join(tmp, "hello.txt");
    inSocket.post(new noflo.IP("data", target));
    await waitStream(outIps, (ips) => ips.length >= 3);
    const statIp = outIps.find((ip) => ip.type === "data");
    const stats = /** @type {Record<string, any>} */ (statIp?.data);
    assert.equal(stats.path, target);
    // The predicate methods are inlined as values (they do not survive
    // object transmission)
    assert.equal(stats.isFile, true);
    assert.equal(stats.isDirectory, false);
  });
});

describe("MIME components", () => {
  it("PathToMime resolves known extensions", () => {
    const c = getPathToMime();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", "/tmp/file.txt"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["text/plain"],
    );
  });

  it("PathToMime knows the custom markdown extension", () => {
    const c = getPathToMime();
    const { inSocket, outIps } = wire(c, "in", "out");
    inSocket.post(new noflo.IP("data", "/tmp/file.md"));
    assert.deepEqual(
      outIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["text/x-markdown"],
    );
  });

  it("MimeRouter routes by MIME substring", () => {
    const c = getMimeRouter();
    const missedSocket = noflo.internalSocket.createSocket();
    c.outPorts.missed.attach(missedSocket);
    const { inSocket, outIps } = wire(c, "in", "out");
    const routesSocket = noflo.internalSocket.createSocket();
    c.inPorts.routes.attach(routesSocket);
    routesSocket.post(new noflo.IP("data", ["text", "image"]));
    inSocket.post(new noflo.IP("data", "/tmp/file.txt"));
    assert.equal(
      /** @type {import("@noflo/noflo").IP} */ (
        outIps.find((ip) => ip.type === "data")
      ).index,
      0,
    );
  });

  it("MimeRouter sends unknown types to missed", () => {
    const c = getMimeRouter();
    const missedSocket = noflo.internalSocket.createSocket();
    c.outPorts.missed.attach(missedSocket);
    const missedIps = collect(missedSocket);
    const { inSocket } = wire(c, "in", "out");
    const routesSocket = noflo.internalSocket.createSocket();
    c.inPorts.routes.attach(routesSocket);
    routesSocket.post(new noflo.IP("data", ["image"]));
    inSocket.post(new noflo.IP("data", "/tmp/file.txt"));
    assert.deepEqual(
      missedIps.filter((ip) => ip.type === "data").map((ip) => ip.data),
      ["/tmp/file.txt"],
    );
  });

  it("MimeDocumentRouter routes documents by their path property", () => {
    const c = getMimeDocumentRouter();
    const { inSocket, outIps } = wire(c, "in", "out");
    const routesSocket = noflo.internalSocket.createSocket();
    c.inPorts.routes.attach(routesSocket);
    routesSocket.post(new noflo.IP("data", ["html"]));
    inSocket.post(
      new noflo.IP("data", { path: "/tmp/page.html", body: "<html/>" }),
    );
    const routed = /** @type {import("@noflo/noflo").IP} */ (
      outIps.find((ip) => ip.type === "data")
    );
    assert.equal(routed.index, 0);
    assert.deepEqual(routed.data, { path: "/tmp/page.html", body: "<html/>" });
  });
});

describe("Buffer components", () => {
  it("DirectoryBuffer collects paths per directory until released", async () => {
    const c = getDirectoryBuffer();
    const collectSocket = noflo.internalSocket.createSocket();
    const releaseSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.collect.attach(collectSocket);
    c.inPorts.release.attach(releaseSocket);
    c.outPorts.out.attach(outSocket);
    const outIps = collect(outSocket);
    collectSocket.post(new noflo.IP("openBracket", "batch1"));
    collectSocket.post(new noflo.IP("data", path.join(tmp, "pending.txt")));
    collectSocket.post(new noflo.IP("closeBracket", "batch1"));
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.deepEqual(outIps, []);
    releaseSocket.post(new noflo.IP("data", tmp));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.deepEqual(render(outIps), [
      "< batch1",
      `DATA ${JSON.stringify(path.join(tmp, "pending.txt"))}`,
      ">",
    ]);
  });

  it("DirectoryGroupBuffer keys the buffer by the group trail", async () => {
    const c = getDirectoryGroupBuffer();
    const collectSocket = noflo.internalSocket.createSocket();
    const releaseSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.collect.attach(collectSocket);
    c.inPorts.release.attach(releaseSocket);
    c.outPorts.out.attach(outSocket);
    const outIps = collect(outSocket);
    // Group trails form a path; the buffer key is their dirname
    collectSocket.post(new noflo.IP("openBracket", "tmp"));
    collectSocket.post(new noflo.IP("openBracket", "sub"));
    collectSocket.post(new noflo.IP("data", "payload"));
    collectSocket.post(new noflo.IP("closeBracket", "sub"));
    collectSocket.post(new noflo.IP("closeBracket", "tmp"));
    await new Promise((resolve) => setTimeout(resolve, 30));
    releaseSocket.post(new noflo.IP("data", "tmp"));
    await waitStream(outIps, (ips) => ips.length > 0);
    assert.deepEqual(render(outIps), [
      "< tmp",
      "< sub",
      'DATA "payload"',
      ">",
      ">",
    ]);
  });
});
