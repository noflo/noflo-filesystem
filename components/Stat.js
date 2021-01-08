/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// The Stat component receives a path on the source port, and
// sends a stats object describing that path to the out port. In case
// of errors the error message will be sent to the error port.

const fs = require("fs");
const noflo = require("noflo");

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'search';
  c.description = 'Read statistics of a file';

  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path'
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
    const path = input.getData('in');
    return fs.stat(path, function(err, stats) {
      if (err) { return output.done(err); }
      stats.path = path;
      for (let func of [
        "isFile",
        "isDirectory",
        "isBlockDevice",
        "isCharacterDevice",
        "isFIFO",
        "isSocket"
      ]) {
        stats[func] = stats[func]();
      }
      output.send({
        out: new noflo.IP('openBracket', path)});
      output.send({
        out: stats});
      return output.sendDone({
        out: new noflo.IP('closeBracket', path)});
    });
  });
};
