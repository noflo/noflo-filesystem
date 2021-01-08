/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const directorybuffer = require("../components/DirectoryGroupBuffer");
const socket = require('noflo').internalSocket;
const path = require('path');

const setupComponent = function() {
  const c = directorybuffer.getComponent();
  const collect = socket.createSocket();
  const release = socket.createSocket();
  const out = socket.createSocket();
  c.inPorts.collect.attach(collect);
  c.inPorts.release.attach(release);
  c.outPorts.out.attach(out);
  return [c, collect, release, out];
};

exports['test that unreleased packets don\'t get sent'] = function(test) {
  const [c, collect, release, out] = Array.from(setupComponent());
  out.on('data', function() {
    test.ok('false', 'Should not have sent data');
    return test.done();
  });
  setTimeout(function() {
    test.ok('true', 'Did not send data');
    return test.done();
  }
  , 1000);
  collect.beginGroup(__filename);
  collect.send('foo');
  return collect.endGroup();
};
exports['test that packets get released when told to do so'] = function(test) {
  let part;
  const [c, collect, release, out] = Array.from(setupComponent());
  const groups = [];
  const files = [{
    data: 'bar',
    groups: __filename.split(path.sep)
  }
  ];
  out.on('begingroup', group => groups.push(group));
  out.on('data', function(data) {
    const file = files.shift();
    const packetGroups = groups.slice(0);
    test.equal(data, file.data);
    test.deepEqual(packetGroups, file.groups);
    if (!files.length) { return test.done(); }
  });
  out.on('endgroup', group => groups.pop());
  const wrongPath = path.resolve(__dirname, '../components/DirectoryBuffer.coffee');
  for (part of Array.from(wrongPath.split(path.sep))) { collect.beginGroup(part); }
  collect.send('foo');
  for (part of Array.from(wrongPath.split(path.sep))) { collect.endGroup(); }
  for (part of Array.from(__filename.split(path.sep))) { collect.beginGroup(part); }
  collect.send('bar');
  for (part of Array.from(__filename.split(path.sep))) { collect.endGroup(); }
  return release.send(__dirname);
};
exports['test that packets sent after release get released too'] = function(test) {
  let part;
  const [c, collect, release, out] = Array.from(setupComponent());
  const groups = [];
  const files = [{
    data: 'bar',
    groups: __filename.split(path.sep)
  }
  , {
    data: 'baz',
    groups: path.resolve(__dirname, 'ReadFile.coffee').split(path.sep)
  }
  ];
  out.on('begingroup', group => groups.push(group));
  out.on('data', function(data) {
    const file = files.shift();
    const packetGroups = groups.slice(0);
    test.equal(data, file.data);
    test.deepEqual(packetGroups, file.groups);
    if (!files.length) { return test.done(); }
  });
  out.on('endgroup', group => groups.pop());
  const wrongPath = path.resolve(__dirname, '../components/DirectoryBuffer.coffee');
  for (part of Array.from(wrongPath.split(path.sep))) { collect.beginGroup(part); }
  collect.send('foo');
  for (part of Array.from(wrongPath.split(path.sep))) { collect.endGroup(); }
  for (part of Array.from(__filename.split(path.sep))) { collect.beginGroup(part); }
  collect.send('bar');
  for (part of Array.from(__filename.split(path.sep))) { collect.endGroup(); }
  release.send(__dirname);
  const secondFile = path.resolve(__dirname, 'ReadFile.coffee');
  for (part of Array.from(secondFile.split(path.sep))) { collect.beginGroup(part); }
  collect.send('baz');
  return (() => {
    const result = [];
    for (part of Array.from(secondFile.split(path.sep))) {       result.push(collect.endGroup());
    }
    return result;
  })();
};
