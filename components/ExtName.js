/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const noflo = require("noflo");

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'file';
  c.description = 'Get the file extension for a file path';

  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path'
  }
  );
  c.outPorts.add('out',
    {datatype: 'string'});

  return c.process((input, output) => output.sendDone({
    out: path.extname(input.getData('in'))}));
};
