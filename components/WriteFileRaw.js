/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'floppy-o';
  c.description = 'Write a buffer into a file';

  c.inPorts.add('in', {
    datatype: 'buffer',
    description: 'Contents to write'
  }
  );
  c.inPorts.add('filename', {
    datatype: 'string',
    description: 'File path to write to'
  }
  );
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

  return c.process(function(input, output) {
    if (!input.hasData('in', 'filename')) { return; }
    const [ filename, buffer ] = Array.from(input.getData('filename', 'buffer'));
    return fs.writeFile(filename, buffer, function(err) {
      if (err) { return output.done(err); }
      return output.sendDone({
        out: data.filename});
    });
  });
};
