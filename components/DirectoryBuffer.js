const noflo = require('noflo');
const path = require('path');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'folder';
  c.description = 'Collect file paths to a buffer until released';
  c.inPorts.add('collect', {
    datatype: 'string',
    description: 'File paths to collect',
  });
  c.inPorts.add('release', {
    datatype: 'string',
    description: 'Directory to release',
  });
  c.outPorts.add('out',
    { datatype: 'string' });
  c.tearDown = function (callback) {
    delete c.buffers;
    delete c.released;
    callback();
  };
  return c.process((input, output) => {
    if (!c.buffers) { c.buffers = {}; }
    if (!c.released) { c.released = []; }

    const releasePacket = function (packet) {
      packet.groups.forEach((group) => {
        output.send({ out: new noflo.IP('openBracket', group) });
      });
      output.send({ out: new noflo.IP('data', packet.data) });
      packet.groups.forEach((group) => {
        output.send({ out: new noflo.IP('closeBracket', group) });
      });
    };

    if (input.hasData('release')) {
      // Releasing a directory
      const release = input.getData('release');
      if (c.released.indexOf(release) !== -1) {
        // Already released, skip
        output.done();
        return;
      }
      c.released.push(release);
      if (!c.buffers[release]) {
        output.done();
        return;
      }
      c.buffers[release].forEach((packet) => {
        releasePacket(packet);
      });
      delete c.buffers[release];
      output.done();
      return;
    }

    if (!input.hasStream('collect')) { return; }
    const collect = input.getStream('collect');
    const groups = [];
    collect.forEach((ip) => {
      if (ip.type === 'openBracket') {
        groups.push(ip.data);
        return;
      }
      if (ip.type === 'data') {
        const packet = {
          data: ip.data,
          groups: groups.slice(0),
        };
        const directory = path.dirname(ip.data);
        if (c.released.indexOf(directory) !== -1) {
          // Already released
          releasePacket(packet);
          return;
        }
        // Add to buffer
        if (!c.buffers[directory]) { c.buffers[directory] = []; }
        c.buffers[directory].push(packet);
        return;
      }
      if (ip.type === 'closeBracket') {
        groups.pop();
      }
    });
    output.done();
  });
};
