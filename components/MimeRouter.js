const noflo = require('noflo');
const mimetype = require('mimetype');

// @runtime noflo-nodejs

// Extra MIME types config
mimetype.set('.markdown', 'text/x-markdown');
mimetype.set('.md', 'text/x-markdown');
mimetype.set('.xml', 'text/xml');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'code-fork';
  c.inPorts.add('routes', {
    datatype: 'array',
    control: true,
  });
  c.inPorts.add('in',
    { datatype: 'string' });
  c.outPorts.add('out', {
    datatype: 'string',
    addressable: true,
  });
  c.outPorts.add('missed',
    { datatype: 'string' });
  c.forwardBrackets = { in: ['out', 'missed'] };
  return c.process((input, output) => {
    if (!input.hasData('routes', 'in')) { return; }
    let routes = input.getData('routes');
    const data = input.get('in');
    if (typeof routes === 'string') {
      routes = routes.split(',');
    }
    const mime = mimetype.lookup(data);
    if (!mime) {
      output.sendDone({ missed: data });
      return;
    }

    let selected = null;
    for (let id = 0; id < routes.length; id += 1) {
      const matcher = routes[id];
      if (mime.indexOf(matcher) !== -1) { selected = id; }
    }
    if (selected === null) {
      output.sendDone({ missed: data });
      return;
    }
    output.sendDone({
      out: new noflo.IP('data', data,
        { index: selected }),
    });
  });
};
