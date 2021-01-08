const path = require('path');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'font';
  c.description = 'Resolve a relative path to an absolute one';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Path to resolve',
  });
  c.outPorts.add('out',
    { datatype: 'string' });
  return c.process((input, output) => {
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');
    output.sendDone({ out: path.resolve(data) });
  });
};
