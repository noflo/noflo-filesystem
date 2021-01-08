const path = require('path');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'font';
  c.description = 'normalize a path';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path to normalize',
  });
  c.outPorts.add('out',
    { datatype: 'string' });
  return c.process((input, output) => {
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');
    output.sendDone({ out: path.normalize(data) });
  });
};
