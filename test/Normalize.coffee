normalize = require '../components/Normalize'
path = require 'path'
socket = require('noflo').internalSocket

setupComponent = ->
  c = normalize.getComponent()
  ins = socket.createSocket()
  out = socket.createSocket()
  c.inPorts.in.attach ins
  c.outPorts.out.attach out
  return [c, ins, out]

exports['test multiple / path'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, path.normalize 'test////Resolve.coffee'
    test.ok true
    test.done()
  ins.send 'test////Resolve.coffee'
  ins.disconnect()

exports['test ../ removal'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, 'Resolve.coffee'
    test.ok true
    test.done()
  ins.send 'test/../Resolve.coffee'
  ins.disconnect()

exports['test ../../ removal'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, path.normalize 'test/../../Resolve.coffee'
    test.ok true
    test.done()
  ins.send 'test/../../Resolve.coffee'
  ins.disconnect()
