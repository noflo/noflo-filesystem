/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const noflo = require("noflo");

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Join a directory path with a file path';

  c.inPorts.add('directory', {
    datatype: 'string',
    description: 'Directory path',
    required: true
  }
  );
  c.inPorts.add('file', {
    datatype: 'string',
    description: 'File path',
    required: true
  }
  );
  c.outPorts.add('out',
    {datatype: 'string'});
  c.outPorts.add('error', {
    datatype: 'object',
    required: false
  }
  );

  c.forwardbrackets = {
    directory: ['out', 'error'],
    file: ['out', 'error']
  };

  return c.process(function(input, output) {
    if (!input.hasData('directory', 'file')) { return; }
    const [ directory, file ] = Array.from(input.getData('directory', 'file'));
    return output.sendDone({
      out: path.join(directory, file)});
  });
};
