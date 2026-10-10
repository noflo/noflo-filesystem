import { Component } from "@noflo/noflo";
import mimetype from "mimetype";

// Extra MIME types config
mimetype.set(".markdown", "text/x-markdown");
mimetype.set(".md", "text/x-markdown");
mimetype.set(".xml", "text/xml");

/** @returns {import("@noflo/noflo").Component} The configured component */
export function getComponent() {
  const c = new Component({
    icon: "files-o",
    description: "Get MIME type based on file path",
    inPorts: {
      in: {
        datatype: "string",
        description: "File path",
        required: true,
      },
    },
    outPorts: {
      out: { datatype: "string", description: "MIME type" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const pathname = input.getData("in");
    const mime = mimetype.lookup(pathname);
    if (!mime) {
      output.done(new Error(`No MIME type found for '${pathname}'`));
      return;
    }
    output.sendDone({ out: mime });
  });

  return c;
}
