const fs = require('fs');
const path = require('path');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function () {
  const c = new noflo.Component();
  c.icon = 'folder';
  c.description = 'Create a directory';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Directory path to create',
  });
  c.outPorts.add('out', {
    datatype: 'string',
    required: false,
  });
  c.outPorts.add('error', {
    datatype: 'object',
    required: false,
  });

  function mkdir(dir, callback) {
    const dirPath = path.resolve(dir);

    // Try creating it
    fs.mkdir(dirPath, (err) => {
      // Directory was created
      if (!err) {
        callback(null);
        return;
      }

      if (err.code === 'ENOENT') {
        // Parent missing, create
        mkdir(path.dirname(dirPath), (internalError) => {
          if (internalError) {
            callback(internalError);
            return;
          }
          mkdir(dirPath, callback);
        });
        return;
      }
      // Check if the directory actually exists already
      fs.stat(dirPath, (statErr, stat) => {
        if (statErr) {
          callback(err);
          return;
        }
        if (!stat.isDirectory()) {
          callback(new Error(`${dirPath} is not a directory`));
          return;
        }
        callback(null);
      });
    });
  }

  return c.process((input, output) => {
    const dirPath = input.getData('in');
    mkdir(dirPath, (err) => {
      if (err) {
        output.done(err);
        return;
      }
      output.sendDone({ out: dirPath });
    });
  });
};
