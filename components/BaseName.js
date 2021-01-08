const path = require('path');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = () => {
  const c = new noflo.Component();
  c.icon = 'file';
  c.description = 'Get the base name of the file';

  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path',
  });
  c.inPorts.add('ext', {
    datatype: 'string',
    description: 'Extension, if any',
    control: true,
    required: false,
  });
  c.outPorts.add('out',
    { datatype: 'string' });

  return c.process((input, output) => {
    if (!input.hasData('in')) { return; }
    let ext = '';
    if (input.hasData('ext')) {
      ext = input.getData('ext');
    }
    const data = input.getData('in');
    output.sendDone({ out: path.basename(data, ext) });
  });
};
