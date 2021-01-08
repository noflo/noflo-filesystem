/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// The ReadFile component receives a filename on the in port, and
// sends the contents of the specified file to the out port. The filename
// is used to create a named group around the file contents data. In case
// of errors the error message will be sent to the error port.

const fs = require("fs");
const noflo = require("noflo");

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Read a file and send it out as a string';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Source file path'
  }
  );
  c.inPorts.add('encoding', {
    datatype: 'string',
    description: 'File encoding',
    default: 'utf-8',
    control: true
  }
  );
  c.outPorts.add('out', {
    datatype: 'string',
    required: false
  }
  );
  c.outPorts.add('error', {
    datatype: 'object',
    required: false
  }
  );

  return c.process(function(input, output) {
    if (!input.hasData('in')) { return; }
    const fileName = input.getData('in');
    const encoding = input.getData('encoding');
    return fs.readFile(fileName, encoding, function(err, data) {
      if (err) {
        output.done(err);
        return;
      }
      output.send({
        out: new noflo.IP('openBracket', fileName)});
      output.send({
        out: data});
      return output.sendDone({
        out: new noflo.IP('closeBracket', fileName)});
    });
  });
};
