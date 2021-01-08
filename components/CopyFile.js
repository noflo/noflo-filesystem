/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const noflo = require("noflo");

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'copy';
  c.description = 'Copy a file';

  c.inPorts.add('source',
    {datatype: 'string'});
  c.inPorts.add('destination',
    {datatype: 'string'});
  c.outPorts.add('out', {
    datatype: 'string',
    required: false
  }
  );
  c.outPorts.add('error', {
    datatype: 'object',
    required: false
  }
  );

  c.forwardbrackets = {
    source: ['out', 'error'],
    destination: ['out', 'error']
  };

  return c.process(function(input, output) {
    if (!input.hasData('source', 'destination')) { return; }
    const [ source, destination ] = Array.from(input.getData('source', 'destination'));
    const rs = fs.createReadStream(data.source);
    const ws = fs.createWriteStream(data.destination);
    rs.on('error', output.done);
    ws.on('error', output.done);

    rs.pipe(ws);
    return rs.on('end', () => output.sendDone({
      out: data.destination}));
  });
};
