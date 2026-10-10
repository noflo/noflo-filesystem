import { Component, IP } from "@noflo/noflo";
import mimetype from "mimetype";

// Extra MIME types config
mimetype.set(".markdown", "text/x-markdown");
mimetype.set(".md", "text/x-markdown");
mimetype.set(".xml", "text/xml");

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "code-fork",
    description: "Route a MIME document to a connection based on its path",
    inPorts: {
      routes: { datatype: "array", control: true, required: true },
      in: { datatype: "object", required: true },
    },
    outPorts: {
      out: {
        datatype: "object",
        addressable: true,
      },
      missed: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("routes", "in")) {
      return;
    }
    let routes = input.getData("routes");
    const data = input.getData("in");
    if (typeof routes === "string") {
      routes = routes.split(",");
    }
    if (!data.path) {
      output.sendDone({ missed: data });
      return;
    }
    const mime = mimetype.lookup(data.path);
    if (!mime) {
      output.sendDone({ missed: data });
      return;
    }

    let selected = null;
    for (let id = 0; id < routes.length; id += 1) {
      const matcher = routes[id];
      if (mime.indexOf(matcher) !== -1) {
        selected = id;
      }
    }
    if (selected === null) {
      output.sendDone({ missed: data });
      return;
    }
    const ip = new IP("data", data);
    ip.index = selected;
    output.sendDone({
      out: ip,
    });
  });

  return c;
}
