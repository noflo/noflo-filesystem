/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.icon = 'folder';
  c.description = 'Create a directory';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Directory path to create'
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

  var mkdir = function(dirPath, callback) {
    const orig = dirPath;
    dirPath = path.resolve(dirPath);

    // Try creating it
    return fs.mkdir(dirPath, function(err) {
      // Directory was created
      if (!err) { return callback(null); }

      if (err.code === 'ENOENT') {
        // Parent missing, create
        mkdir(path.dirname(dirPath), function(err) {
          if (err) { return callback(err); }
          return mkdir(dirPath, callback);
        });
        return;
      }
      // Check if the directory actually exists already
      return fs.stat(dirPath, function(statErr, stat) {
        if (statErr) { return callback(err); }
        if (!stat.isDirectory()) {
          return callback(new Error(`${dirPath} is not a directory`));
        }
        return callback(null);
      });
    });
  };

  return c.process(function(input, output) {
    const dirPath = input.getData('in');
    return mkdir(dirPath, function(err) {
      if (err) {
        output.done(err);
        return;
      }
      return output.sendDone({
        out: dirPath});
    });
  });
};
