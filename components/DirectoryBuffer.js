/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');
const path = require('path');

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'folder';
  c.description = 'Collect file paths to a buffer until released';
  c.inPorts.add('collect', {
    datatype: 'string',
    description: 'File paths to collect'
  }
  );
  c.inPorts.add('release', {
    datatype: 'string',
    description: 'Directory to release'
  }
  );
  c.outPorts.add('out',
    {datatype: 'string'});
  c.tearDown = function(callback) {
    delete c.buffers;
    delete c.released;
    return callback();
  };
  return c.process(function(input, output) {
    let packet;
    if (!c.buffers) { c.buffers = {}; }
    if (!c.released) { c.released = []; }

    const releasePacket = function(packet) {
      let group;
      for (group of Array.from(packet.groups)) {
        output.send({
          out: new noflo.IP('openBracket', group)});
      }
      output.send({
        out: new noflo.IP('data', packet.data)});
      for (group of Array.from(packet.groups)) {
        output.send({
          out: new noflo.IP('closeBracket', group)});
      }
    };

    if (input.hasData('release')) {
      // Releasing a directory
      const release = input.getData('release');
      if (c.released.indexOf(release) !== -1) {
        // Already released, skip
        return output.done();
      }
      c.released.push(release);
      if (!c.buffers[release]) { return output.done(); }
      for (packet of Array.from(c.buffers[release])) {
        releasePacket(packet);
      }
      delete c.buffers[release];
      output.done();
      return;
    }

    if (!input.hasStream('collect')) { return; }
    const collect = input.getStream('collect');
    const groups = [];
    for (let ip of Array.from(collect)) {
      if (ip.type === 'openBracket') {
        groups.push(ip.data);
        continue;
      }
      if (ip.type === 'data') {
        packet = {
          data: ip.data,
          groups: groups.slice(0)
        };
        const directory = path.dirname(ip.data);
        if (c.released.indexOf(directory) !== -1) {
          // Already released
          releasePacket(packet);
          continue;
        }
        // Add to buffer
        if (!c.buffers[directory]) { c.buffers[directory] = []; }
        c.buffers[directory].push(packet);
        continue;
      }
      if (ip.type === 'closeBracket') {
        groups.pop();
        continue;
      }
    }
    return output.done();
  });
};
