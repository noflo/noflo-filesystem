/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const resolve = require('../components/Resolve');
const socket = require('noflo').internalSocket;
const path = require('path');

const setupComponent = function () {
  const c = resolve.getComponent();
  const ins = socket.createSocket();
  const out = socket.createSocket();
  c.inPorts.in.attach(ins);
  c.outPorts.out.attach(out);
  return [c, ins, out];
};

exports['test relative path'] = function (test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', (p) => {
    test.equal(p[0], path.resolve('/')[0]);
    test.ok(true);
    return test.done();
  });
  ins.send('test/Resolve.js');
  return ins.disconnect();
};
