// The Stat component receives a path on the source port, and
// sends a stats object describing that path to the out port. In case
// of errors the error message will be sent to the error port.

const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'search';
  c.description = 'Read statistics of a file';

  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path',
  });
  c.outPorts.add('out', {
    datatype: 'string',
    required: false,
  });
  c.outPorts.add('error', {
    datatype: 'object',
    required: false,
  });

  return c.process((input, output) => {
    const path = input.getData('in');
    fs.stat(path, (err, s) => {
      if (err) {
        output.done(err);
        return;
      }
      const stats = {
        ...s,
        path,
      };
      const methods = [
        'isFile',
        'isDirectory',
        'isBlockDevice',
        'isCharacterDevice',
        'isFIFO',
        'isSocket',
      ];
      methods.forEach((func) => {
        stats[func] = s[func]();
      });
      output.send({ out: new noflo.IP('openBracket', path) });
      output.send({ out: stats });
      output.sendDone({ out: new noflo.IP('closeBracket', path) });
    });
  });
};
