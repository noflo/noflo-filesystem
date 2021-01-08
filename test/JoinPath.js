/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const join = require('../components/JoinPath');
const path = require('path');
const socket = require('noflo').internalSocket;

const setupComponent = function () {
  const c = join.getComponent();
  const directory = socket.createSocket();
  const file = socket.createSocket();
  const out = socket.createSocket();
  c.inPorts.directory.attach(directory);
  c.inPorts.file.attach(file);
  c.outPorts.out.attach(out);
  return [c, directory, file, out];
};

exports['test path joining'] = function (test) {
  const [c, directory, file, out] = Array.from(setupComponent());
  out.once('data', (p) => {
    test.equal(p, __filename);
    return test.done();
  });
  directory.send(__dirname);
  return file.send('JoinPath.js');
};
