/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const readenv = require("../components/CopyTree");
const socket = require('noflo').internalSocket;

const setupComponent = function() {
  const c = readenv.getComponent();
  const from = socket.createSocket();
  const to = socket.createSocket();
  const out = socket.createSocket();
  const err = socket.createSocket();
  c.inPorts.from.attach(from);
  c.inPorts.to.attach(to);
  c.outPorts.out.attach(out);
  c.outPorts.error.attach(err);
  return [c, from, to, out, err];
};

exports['test component instantiation'] = function(test) {
  const [c, from, to, out, err] = Array.from(setupComponent());

  test.ok(from);
  return test.done();
};
