const noflo = require('noflo');
const mimetype = require('mimetype');

// @runtime noflo-nodejs

// Extra MIME types config
mimetype.set('.markdown', 'text/x-markdown');
mimetype.set('.md', 'text/x-markdown');
mimetype.set('.xml', 'text/xml');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'files-o';
  c.description = 'Get MIME type based on file path';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'File path',
  });
  c.outPorts.add('out', {
    datatype: 'string',
    description: 'MIME type',
  });
  c.outPorts.add('error',
    { datatype: 'object' });
  return c.process((input, output) => {
    if (!input.hasData('in')) { return; }
    const pathname = input.getData('in');
    const mime = mimetype.lookup(pathname);
    if (!mime) {
      output.done(new Error(`No MIME type found for '${pathname}'`));
      return;
    }
    output.sendDone({ out: mime });
  });
};
