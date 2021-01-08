const path = require('path');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'folder';
  c.description = 'Get the directory path of a file path';

  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path',
  });
  c.outPorts.add('out',
    { datatype: 'string' });

  return c.process((input, output) => {
    output.sendDone({ out: path.dirname(input.getData('in')) });
  });
};
