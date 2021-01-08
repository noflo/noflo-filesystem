const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'trash';
  c.description = 'Remove a file';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path to remove',
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
    fs.unlink(path, (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: path });
    });
  });
};
