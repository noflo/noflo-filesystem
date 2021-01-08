/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const unlink = require('../components/Unlink');
const socket = require('noflo').internalSocket;
const fs = require('fs');
const path = require('path');
const os = require('os');

const setupComponent = function () {
  const c = unlink.getComponent();
  const ins = socket.createSocket();
  const out = socket.createSocket();
  const err = socket.createSocket();
  c.inPorts.in.attach(ins);
  c.outPorts.out.attach(out);
  c.outPorts.error.attach(err);
  return [c, ins, out, err];
};

exports['test unlink nonexistent path'] = function (test) {
  const [c, ins, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.equal(err.code, 'ENOENT');
    test.equal(path.basename(err.path), 'doesnotexist');
    return test.done();
  });
  out.once('data', (path) => {
    test.fail();
    return test.done();
  });
  return ins.send('doesnotexist');
};

exports['test unlink file'] = function (test) {
  fs.writeFileSync('test-unlink-file', 'TEST');
  const [c, ins, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.fail(err);
    return test.done();
  });
  out.once('data', (path) => {
    test.ok(path === 'test-unlink-file');
    return test.done();
  });
  return ins.send('test-unlink-file');
};

exports['test unlink dir'] = function (test) {
  fs.mkdirSync('test-unlink-dir');
  const [c, ins, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    if (os.platform() === 'win32') {
      test.equal(err.code, 'EPERM');
    } else {
      test.equal(err.code, 'EISDIR');
    }
    test.equal(path.basename(err.path), 'test-unlink-dir');
    fs.rmdirSync('test-unlink-dir');
    return test.done();
  });
  out.once('data', (path) => {
    test.fail();
    return test.done();
  });
  return ins.send('test-unlink-dir');
};

exports['test unlink more than once'] = function (test) {
  fs.writeFileSync('test-unlink-file1', 'TEST');
  fs.writeFileSync('test-unlink-file2', 'TEST');
  const [c, ins, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.fail(err);
    return test.done();
  });
  out.once('data', (path) => {
    test.equal(path, 'test-unlink-file1');
    return out.once('data', (path) => {
      test.equal(path, 'test-unlink-file2');
      return test.done();
    });
  });
  ins.send('test-unlink-file1');
  ins.disconnect();
  ins.send('test-unlink-file2');
  return ins.disconnect();
};
