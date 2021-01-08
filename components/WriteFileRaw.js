const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'floppy-o';
  c.description = 'Write a buffer into a file';

  c.inPorts.add('in', {
    datatype: 'buffer',
    description: 'Contents to write',
  });
  c.inPorts.add('filename', {
    datatype: 'string',
    description: 'File path to write to',
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
    if (!input.hasData('in', 'filename')) { return; }
    const [filename, buffer] = input.getData('filename', 'buffer');
    fs.writeFile(filename, buffer, (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: filename });
    });
  });
};
