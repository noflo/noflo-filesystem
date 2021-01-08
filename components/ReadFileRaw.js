const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Read a file and send it out as a buffer';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Source file path',
  });
  c.outPorts.add('out',
    { datatype: 'buffer' });
  c.outPorts.add('error', {
    datatype: 'object',
    required: false,
  });

  function readBuffer(fd, pos, size, buffer, output, callback) {
    let position = pos;
    fs.read(fd, buffer, 0, buffer.length, position, (err, bytes, buf) => {
      if (err) {
        callback(err);
        return;
      }
      output.send({ out: buf.slice(0, bytes) });
      position += buf.length;
      if (position >= size) {
        output.sendDone({ out: new noflo.IP('closeBracket') });
        callback(null);
        return;
      }
      readBuffer(fd, position, size, buf, output, callback);
    });
  }

  return c.process((input, output) => {
    if (!input.hasData('in')) { return; }
    const filename = input.getData('in');
    fs.open(filename, 'r', (err, fd) => {
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
        output.send({ out: new noflo.IP('openBracket', filename) });
        readBuffer(fd, 0, stats.size, buffer, output, output.done);
      });
    });
  });
};
