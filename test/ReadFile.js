/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const readfile = require('../components/ReadFile');
const socket = require('noflo').internalSocket;
const path = require('path');

const setupComponent = function () {
  const c = readfile.getComponent();
  const src = socket.createSocket();
  const out = socket.createSocket();
  const err = socket.createSocket();
  c.inPorts.in.attach(src);
  c.outPorts.out.attach(out);
  c.outPorts.error.attach(err);
  return [c, src, out, err];
};

exports['test error reading file'] = function (test) {
  const [c, src, out, err] = Array.from(setupComponent());
  err.once('data', (err) => {
    test.equal(err.code, 'ENOENT');
    test.equal(path.basename(err.path), 'doesnotexist');
    return test.done();
  });
  return src.send('doesnotexist');
};

exports['test reading file'] = function (test) {
  const [c, src, out, err] = Array.from(setupComponent());
  let expect = 'begingroup';
  err.once('data', (err) => {
    test.fail(err.message);
    return test.done();
  });
  out.once('begingroup', (group) => {
    test.equal('begingroup', expect);
    test.equal(group, 'components/ReadFile.js');
    return expect = 'data';
  });
  out.once('data', (data) => {
    test.equal('data', expect);
    test.ok(data.length > 0);
    return expect = 'endgroup';
  });
  out.once('endgroup', () => {
    test.equal('endgroup', expect);
    return test.done();
  });
  return src.send('components/ReadFile.js');
};
