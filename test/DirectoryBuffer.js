/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const directorybuffer = require('../components/DirectoryBuffer');
const socket = require('noflo').internalSocket;
const path = require('path');

const setupComponent = function () {
  const c = directorybuffer.getComponent();
  const collect = socket.createSocket();
  const release = socket.createSocket();
  const out = socket.createSocket();
  c.inPorts.collect.attach(collect);
  c.inPorts.release.attach(release);
  c.outPorts.out.attach(out);
  return [c, collect, release, out];
};

exports['test that unreleased packets don\'t get sent'] = function (test) {
  const [c, collect, release, out] = Array.from(setupComponent());
  out.on('data', () => {
    test.ok('false', 'Should not have sent data');
    return test.done();
  });
  setTimeout(() => {
    test.ok('true', 'Did not send data');
    return test.done();
  },
  1000);
  collect.beginGroup('foo');
  collect.send(__filename);
  return collect.endGroup();
};
exports['test that packets get released when told to do so'] = function (test) {
  const [c, collect, release, out] = Array.from(setupComponent());
  const groups = [];
  const files = [{
    path: __filename,
    groups: ['bar'],
  },
  ];
  out.on('begingroup', (group) => groups.push(group));
  out.on('data', (data) => {
    const file = files.shift();
    const packetGroups = groups.slice(0);
    test.equal(data, file.path);
    test.deepEqual(packetGroups, file.groups);
    if (!files.length) { return test.done(); }
  });
  out.on('endgroup', (group) => groups.pop());
  collect.beginGroup('foo');
  collect.send(path.resolve(__dirname, '../components/DirectoryBuffer.js'));
  collect.endGroup();
  collect.beginGroup('bar');
  collect.send(__filename);
  collect.endGroup();
  return release.send(__dirname);
};
exports['test that packets sent after release get released too'] = function (test) {
  const [c, collect, release, out] = Array.from(setupComponent());
  const groups = [];
  const files = [{
    path: __filename,
    groups: ['bar'],
  },
  {
    path: path.resolve(__dirname, 'ReadFile.js'),
    groups: ['baz'],
  },
  ];
  out.on('begingroup', (group) => groups.push(group));
  out.on('data', (data) => {
    const file = files.shift();
    const packetGroups = groups.slice(0);
    test.equal(data, file.path);
    test.deepEqual(packetGroups, file.groups);
    if (!files.length) { return test.done(); }
  });
  out.on('endgroup', (group) => groups.pop());
  collect.beginGroup('foo');
  collect.send(path.resolve(__dirname, '../components/DirectoryBuffer.js'));
  collect.endGroup();
  collect.beginGroup('bar');
  collect.send(__filename);
  collect.endGroup();
  release.send(__dirname);
  collect.beginGroup('baz');
  collect.send(path.resolve(__dirname, 'ReadFile.js'));
  return collect.endGroup();
};
