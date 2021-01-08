/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');
const mimetype = require('mimetype');

// @runtime noflo-nodejs

// Extra MIME types config
mimetype.set('.markdown', 'text/x-markdown');
mimetype.set('.md', 'text/x-markdown');
mimetype.set('.xml', 'text/xml');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'code-fork';
  c.inPorts.add('routes', {
    datatype: 'array',
    control: true
  }
  );
  c.inPorts.add('in',
    {datatype: 'object'});
  c.outPorts.add('out', {
    datatype: 'object',
    addressable: true
  }
  );
  c.outPorts.add('missed',
    {datatype: 'object'});
  c.forwardBrackets =
    {in: ['out', 'missed']};
  return c.process(function(input, output) {
    if (!input.hasData('routes', 'in')) { return; }
    let [routes, data] = Array.from(input.getData('routes', 'in'));
    if (typeof routes === 'string') {
      routes = routes.split(',');
    }
    if (!data.path) {
      output.sendDone({
        missed: data});
      return;
    }
    const mime = mimetype.lookup(data.path);
    if (!mime) {
      output.sendDone({
        missed: data});
      return;
    }

    let selected = null;
    for (let id = 0; id < routes.length; id++) {
      const matcher = routes[id];
      if (mime.indexOf(matcher) !== -1) { selected = id; }
    }
    if (selected === null) {
      output.sendDone({
        missed: data});
      return;
    }
    return output.sendDone({
      out: new noflo.IP('data', data,
        {index: selected})
    });
  });
};
