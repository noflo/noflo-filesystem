/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const resolve = require('../components/PathToMime');
const socket = require('noflo').internalSocket;

const setupComponent = function () {
  const c = resolve.getComponent();
  const ins = socket.createSocket();
  const out = socket.createSocket();
  c.inPorts.in.attach(ins);
  c.outPorts.out.attach(out);
  return [c, ins, out];
};

exports['test .jpg'] = function (test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', (p) => {
    test.equal(p, 'image/jpeg');
    return test.done();
  });
  ins.send('some/path/to/foo.jpg');
  return ins.disconnect();
};

exports['test .JPEG'] = function (test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', (p) => {
    test.equal(p, 'image/jpeg');
    return test.done();
  });
  ins.send('some/path/to/FOO.JPEG');
  return ins.disconnect();
};

exports['test .mp4'] = function (test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', (p) => {
    test.equal(p, 'video/mp4');
    return test.done();
  });
  ins.send('some/path/to/bar.mp4');
  return ins.disconnect();
};

exports['test .png'] = function (test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', (p) => {
    test.equal(p, 'image/png');
    return test.done();
  });
  ins.send('some/path/to/bar.png');
  return ins.disconnect();
};
