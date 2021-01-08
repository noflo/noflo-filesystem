// The ReadDir component receives a directory path on the source port, and
// sends the paths of all the files in the directory to the out port. In case
// of errors the error message will be sent to the error port.

const fs = require('fs');
const noflo = require('noflo');
const path = require('path');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'folder-open';
  c.description = 'Get a list of file paths inside a directory';
  c.inPorts.add('source', {
    datatype: 'string',
    description: 'Directory path to read',
  });
  c.outPorts.add('out', {
    datatype: 'string',
    required: false,
  });
  c.outPorts.add('error', {
    datatype: 'object',
    required: false,
  });

  return c.process((input, output) => {
    if (!input.hasData('source')) { return; }
    const dirPath = input.getData('source');
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        output.done(err);
        return;
      }
      const sortedFiles = files.sort();
      output.send({ out: new noflo.IP('openBracket', dirPath) });
      sortedFiles.forEach((f) => {
        output.send({ out: path.join(dirPath, f) });
      });
      output.sendDone({ out: new noflo.IP('closeBracket', dirPath) });
    });
  });
};
