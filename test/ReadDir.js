/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const readdir = require('../components/ReadDir');
const socket = require('noflo').internalSocket;
const path = require('path');

const setupComponent = function () {
  const c = readdir.getComponent();
  const src = socket.createSocket();
  const out = socket.createSocket();
  const err = socket.createSocket();
  c.inPorts.source.attach(src);
  c.outPorts.out.attach(out);
  c.outPorts.error.attach(err);
  return [c, src, out, err];
};

exports.setUp = (callback) => fs.mkdir('test/testdir', () => fs.writeFile('test/testdir/a', 'a', () => fs.writeFile('test/testdir/b', 'b', callback)));
exports.tearDown = (callback) => fs.unlink('test/testdir/b', () => fs.unlink('test/testdir/a', () => fs.rmdir('test/testdir', callback)));
exports['test error reading dir'] = function (test) {
  const [c, src, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.equal(err.code, 'ENOENT');
    test.equal(path.basename(err.path), 'doesnotexist');
    return test.done();
  });
  return src.send('doesnotexist');
};
exports['test reading dir'] = function (test) {
  const [c, src, out, err] = Array.from(setupComponent());
  const expect = [path.join('test/testdir', 'a'), path.join('test/testdir', 'b')];
  out.on('data', (data) => {
    test.equal(data, expect.shift());
    if (expect.length === 0) { return test.done(); }
  });
  return src.send('test/testdir');
};
exports['test reading dir with slash'] = function (test) {
  const [c, src, out, err] = Array.from(setupComponent());
  const expect = [path.join('test/testdir', 'a'), path.join('test/testdir', 'b')];
  out.on('data', (data) => {
    test.equal(data, expect.shift());
    if (expect.length === 0) { return test.done(); }
  });
  return src.send('test/testdir/');
};
