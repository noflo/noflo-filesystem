directorybuffer = require "../components/DirectoryGroupBuffer"
socket = require('noflo').internalSocket
path = require 'path'

setupComponent = ->
  c = directorybuffer.getComponent()
  collect = socket.createSocket()
  release = socket.createSocket()
  out = socket.createSocket()
  c.inPorts.collect.attach collect
  c.inPorts.release.attach release
  c.outPorts.out.attach out
  return [c, collect, release, out]

exports['test that unreleased packets don\'t get sent'] = (test) ->
  [c, collect, release, out] = setupComponent()
  out.on 'data', ->
    test.ok 'false', 'Should not have sent data'
    test.done()
  setTimeout ->
    test.ok 'true', 'Did not send data'
    test.done()
  , 1000
  collect.beginGroup __filename
  collect.send 'foo'
  collect.endGroup()
exports['test that packets get released when told to do so'] = (test) ->
  [c, collect, release, out] = setupComponent()
  groups = []
  files = [
    data: 'bar'
    groups: __filename.split path.sep
  ]
  out.on 'begingroup', (group) ->
    groups.push group
  out.on 'data', (data) ->
    file = files.shift()
    packetGroups = groups.slice 0
    test.equal(data, file.data)
    test.deepEqual(packetGroups, file.groups)
    test.done() unless files.length
  out.on 'endgroup', (group) ->
    groups.pop()
  wrongPath = path.resolve __dirname, '../components/DirectoryBuffer.coffee'
  collect.beginGroup part for part in wrongPath.split path.sep
  collect.send 'foo'
  collect.endGroup() for part in wrongPath.split path.sep
  collect.beginGroup part for part in __filename.split path.sep
  collect.send 'bar'
  collect.endGroup() for part in __filename.split path.sep
  release.send __dirname
exports['test that packets sent after release get released too'] = (test) ->
  [c, collect, release, out] = setupComponent()
  groups = []
  files = [
    data: 'bar'
    groups: __filename.split path.sep
  ,
    data: 'baz'
    groups: path.resolve(__dirname, 'ReadFile.coffee').split path.sep
  ]
  out.on 'begingroup', (group) ->
    groups.push group
  out.on 'data', (data) ->
    file = files.shift()
    packetGroups = groups.slice 0
    test.equal(data, file.data)
    test.deepEqual(packetGroups, file.groups)
    test.done() unless files.length
  out.on 'endgroup', (group) ->
    groups.pop()
  wrongPath = path.resolve __dirname, '../components/DirectoryBuffer.coffee'
  collect.beginGroup part for part in wrongPath.split path.sep
  collect.send 'foo'
  collect.endGroup() for part in wrongPath.split path.sep
  collect.beginGroup part for part in __filename.split path.sep
  collect.send 'bar'
  collect.endGroup() for part in __filename.split path.sep
  release.send __dirname
  secondFile = path.resolve(__dirname, 'ReadFile.coffee')
  collect.beginGroup part for part in secondFile.split path.sep
  collect.send 'baz'
  collect.endGroup() for part in secondFile.split path.sep
