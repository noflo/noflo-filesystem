/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require('path');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'font';
  c.description = 'normalize a path';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path to normalize'
  }
  );
  c.outPorts.add('out',
    {datatype: 'string'});
  return c.process(function(input, output) {
    if (!input.hasData('in')) { return; }
    const data = input.getData('in');
    return output.sendDone({
      out: path.normalize(data)});
  });
};
