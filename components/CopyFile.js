const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'copy';
  c.description = 'Copy a file';

  c.inPorts.add('source',
    { datatype: 'string' });
  c.inPorts.add('destination',
    { datatype: 'string' });
  c.outPorts.add('out', {
    datatype: 'string',
    required: false,
  });
  c.outPorts.add('error', {
    datatype: 'object',
    required: false,
  });

  c.forwardbrackets = {
    source: ['out', 'error'],
    destination: ['out', 'error'],
  };

  return c.process((input, output) => {
    if (!input.hasData('source', 'destination')) { return; }
    const [source, destination] = input.getData('source', 'destination');
    const rs = fs.createReadStream(source);
    const ws = fs.createWriteStream(destination);
    rs.on('error', output.done);
    ws.on('error', output.done);

    rs.pipe(ws);
    rs.on('end', () => output.sendDone({ out: destination }));
  });
};
