directorybuffer = require "../components/DirectoryBuffer"
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
  collect.beginGroup 'foo'
  collect.send __filename
  collect.endGroup()
exports['test that packets get released when told to do so'] = (test) ->
  [c, collect, release, out] = setupComponent()
  groups = []
  files = [
    path: __filename,
    groups: ['bar']
  ]
  out.on 'begingroup', (group) ->
    groups.push group
  out.on 'data', (data) ->
    file = files.shift()
    packetGroups = groups.slice 0
    test.equal(data, file.path)
    test.deepEqual(packetGroups, file.groups)
    test.done() unless files.length
  out.on 'endgroup', (group) ->
    groups.pop()
  collect.beginGroup 'foo'
  collect.send path.resolve __dirname, '../components/DirectoryBuffer.coffee'
  collect.endGroup()
  collect.beginGroup 'bar'
  collect.send __filename
  collect.endGroup()
  release.send __dirname
exports['test that packets sent after release get released too'] = (test) ->
  [c, collect, release, out] = setupComponent()
  groups = []
  files = [
    path: __filename,
    groups: ['bar']
  ,
    path: path.resolve(__dirname, 'ReadFile.coffee')
    groups: ['baz']
  ]
  out.on 'begingroup', (group) ->
    groups.push group
  out.on 'data', (data) ->
    file = files.shift()
    packetGroups = groups.slice 0
    test.equal(data, file.path)
    test.deepEqual(packetGroups, file.groups)
    test.done() unless files.length
  out.on 'endgroup', (group) ->
    groups.pop()
  collect.beginGroup 'foo'
  collect.send path.resolve __dirname, '../components/DirectoryBuffer.coffee'
  collect.endGroup()
  collect.beginGroup 'bar'
  collect.send __filename
  collect.endGroup()
  release.send __dirname
  collect.beginGroup 'baz'
  collect.send path.resolve(__dirname, 'ReadFile.coffee')
  collect.endGroup()
