unlink = require '../components/Unlink'
socket = require('noflo').internalSocket
fs = require 'fs'

setupComponent = ->
  c = unlink.getComponent()
  ins = socket.createSocket()
  out = socket.createSocket()
  err = socket.createSocket()
  c.inPorts.in.attach ins
  c.outPorts.out.attach out
  c.outPorts.error.attach err
  return [c, ins, out, err]

exports['test unlink nonexistent path'] = (test) ->
  [c, ins, out, err] = setupComponent()
  err.once 'data', (err) ->
    test.equal err.errno, 34
    test.equal err.code, 'ENOENT'
    test.equal err.path, 'doesnotexist'
    test.done()
  out.once 'data', (path) ->
    test.fail()
    test.done()
  ins.send 'doesnotexist'

exports["test unlink file"] = (test) ->
  fs.writeFileSync('test-unlink-file', 'TEST')
  [c, ins, out, err] = setupComponent()
  err.once 'data', (err) ->
    test.fail err
    test.done()
  out.once 'data', (path) ->
    test.ok path == 'test-unlink-file'
    test.done()
  ins.send 'test-unlink-file'

exports["test unlink dir"] = (test) ->
  fs.mkdirSync('test-unlink-dir')
  [c, ins, out, err] = setupComponent()
  err.once 'data', (err) ->
    test.equal err.errno, 28
    test.equal err.code, 'EISDIR'
    test.equal err.path, 'test-unlink-dir'
    fs.rmdirSync('test-unlink-dir')
    test.done()
  out.once 'data', (path) ->
    test.fail()
    test.done()
  ins.send 'test-unlink-dir'


exports["test unlink more than once"] = (test) ->
  fs.writeFileSync('test-unlink-file1', 'TEST')
  fs.writeFileSync('test-unlink-file2', 'TEST')
  [c, ins, out, err] = setupComponent()
  err.once 'data', (err) ->
    test.fail err
    test.done()
  out.once 'data', (path) ->
    test.equal path, 'test-unlink-file1'
    out.once 'data', (path) ->
      test.equal path, 'test-unlink-file2'
      test.done()
  ins.send 'test-unlink-file1'
  ins.disconnect()
  ins.send 'test-unlink-file2'
  ins.disconnect()
