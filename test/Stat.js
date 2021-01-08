/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const stat = require('../components/Stat');
const socket = require('noflo').internalSocket;
const path = require('path');

const setupComponent = function () {
  const c = stat.getComponent();
  const ins = socket.createSocket();
  const out = socket.createSocket();
  const err = socket.createSocket();
  c.inPorts.in.attach(ins);
  c.outPorts.out.attach(out);
  c.outPorts.error.attach(err);
  return [c, ins, out, err];
};

exports['test stat nonexistent path'] = function (test) {
  const [c, ins, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.equal(err.code, 'ENOENT');
    test.equal(path.basename(err.path), 'doesnotexist');
    return test.done();
  });
  return ins.send('doesnotexist');
};

exports['test stat file'] = function (test) {
  const [c, ins, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.fail(err);
    return test.done();
  });
  out.once('data', (stats) => {
    test.equal(stats.path, 'test/Stat.js');
    test.equal(stats.isFile, true);
    test.ok('uid' in stats);
    test.ok('mode' in stats);
    test.ok('ctime' in stats);
    return test.done();
  });
  return ins.send('test/Stat.js');
};

exports['test stat dir'] = function (test) {
  const [c, ins, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.fail(err);
    return test.done();
  });
  out.once('data', (stats) => {
    test.equal(stats.path, 'test');
    test.equal(stats.isDirectory, true);
    test.ok('uid' in stats);
    test.ok('mode' in stats);
    test.ok('ctime' in stats);
    return test.done();
  });
  return ins.send('test');
};
