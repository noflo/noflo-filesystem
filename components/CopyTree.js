/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs.extra');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'copy';
  c.description = 'Copy a directory tree';

  c.inPorts.add('from', {
    datatype: 'string',
    description: 'Source path'
  }
  );
  c.inPorts.add('to', {
    datatype: 'string',
    description: 'Target path'
  }
  );
  c.outPorts.add('out',
    {datatype: 'string'});
  c.outPorts.add('error',
    {datatype: 'object'});

  c.forwardbrackets = {
    from: ['out', 'error'],
    to: ['out', 'error']
  };

  return c.process(function(input, output) {
    if (!input.hasData('from', 'to')) { return; }
    const data = input.getData('from', 'to');
    return fs.copyRecursive(data[0], data[1], function(err) {
      if (err) {
        output.done(err);
        return;
      }
      return output.sendDone({
        out: data[1]});
  });});
};
