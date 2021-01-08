/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'trash';
  c.description = 'Remove a file';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path to remove'
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
    const path = input.getData('in');
    return fs.unlink(path, function(err) {
      if (err) { return output.done(err); }
      return output.sendDone({
        out: path});
    });
  });
};
