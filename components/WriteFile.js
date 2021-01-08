const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'floppy-o';
  c.description = 'Write a string into a file';

  c.inPorts.add('in', {
    datatype: 'string',
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
    const [filename, data] = input.getData('filename', 'in');
    fs.writeFile(filename, data, 'utf-8', (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: data.filename });
    });
  });
};
