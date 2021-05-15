const fs = require('fs-extra');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'copy';
  c.description = 'Copy a directory tree';

  c.inPorts.add('from', {
    datatype: 'string',
    description: 'Source path',
  });
  c.inPorts.add('to', {
    datatype: 'string',
    description: 'Target path',
  });
  c.outPorts.add('out',
    { datatype: 'string' });
  c.outPorts.add('error',
    { datatype: 'object' });

  c.forwardbrackets = {
    from: ['out', 'error'],
    to: ['out', 'error'],
  };

  return c.process((input, output) => {
    if (!input.hasData('from', 'to')) { return; }
    const data = input.getData('from', 'to');
    fs.copyRecursive(data[0], data[1], (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: data[1] });
    });
  });
};
