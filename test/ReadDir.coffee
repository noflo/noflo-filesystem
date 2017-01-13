fs = require "fs"
readdir = require "../components/ReadDir"
socket = require('noflo').internalSocket
path = require 'path'

setupComponent = ->
    c = readdir.getComponent()
    src = socket.createSocket()
    out = socket.createSocket()
    err = socket.createSocket()
    c.inPorts.source.attach src
    c.outPorts.out.attach out
    c.outPorts.error.attach err
    return [c, src, out, err]

exports.setUp = (callback) ->
  fs.mkdir "test/testdir", ->
    fs.writeFile "test/testdir/a", "a", ->
      fs.writeFile "test/testdir/b", "b", callback
exports.tearDown = (callback) ->
  fs.unlink "test/testdir/b", ->
    fs.unlink "test/testdir/a", ->
      fs.rmdir "test/testdir", callback
exports["test error reading dir"] = (test) ->
  [c, src, out, err] = setupComponent()
  err.once "data", (err) ->
    test.equal err.code, 'ENOENT'
    test.equal path.basename(err.path), 'doesnotexist'
    test.done()
  src.send "doesnotexist"
exports["test reading dir"] = (test) ->
  [c, src, out, err] = setupComponent()
  expect = [path.join('test/testdir', 'a'), path.join('test/testdir', 'b')]
  out.on "data", (data) ->
    test.equal data, expect.shift()
    test.done() if expect.length == 0
  src.send "test/testdir"
exports["test reading dir with slash"] = (test) ->
  [c, src, out, err] = setupComponent()
  expect = [path.join('test/testdir', 'a'), path.join('test/testdir', 'b')]
  out.on "data", (data) ->
    test.equal data, expect.shift()
    test.done() if expect.length == 0
  src.send "test/testdir/"
