/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const normalize = require('../components/Normalize');
const path = require('path');
const socket = require('noflo').internalSocket;

const setupComponent = function() {
  const c = normalize.getComponent();
  const ins = socket.createSocket();
  const out = socket.createSocket();
  c.inPorts.in.attach(ins);
  c.outPorts.out.attach(out);
  return [c, ins, out];
};

exports['test multiple / path'] = function(test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', function(p) {
    test.equal(p, path.normalize('test////Resolve.coffee'));
    test.ok(true);
    return test.done();
  });
  ins.send('test////Resolve.coffee');
  return ins.disconnect();
};

exports['test ../ removal'] = function(test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', function(p) {
    test.equal(p, 'Resolve.coffee');
    test.ok(true);
    return test.done();
  });
  ins.send('test/../Resolve.coffee');
  return ins.disconnect();
};

exports['test ../../ removal'] = function(test) {
  const [c, ins, out] = Array.from(setupComponent());
  out.once('data', function(p) {
    test.equal(p, path.normalize('test/../../Resolve.coffee'));
    test.ok(true);
    return test.done();
  });
  ins.send('test/../../Resolve.coffee');
  return ins.disconnect();
};
