normalize = require '../components/Normalize'
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
  out.once 'data', (path) ->
    test.equal path, 'test/Resolve.coffee'
    test.ok true
    test.done()
  ins.send 'test////Resolve.coffee'
  ins.disconnect()

exports['test ../ removal'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (path) ->
    test.equal path, 'Resolve.coffee'
    test.ok true
    test.done()
  ins.send 'test/../Resolve.coffee'
  ins.disconnect()

exports['test ../../ removal'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (path) ->
    test.equal path, '../Resolve.coffee'
    test.ok true
    test.done()
  ins.send 'test/../../Resolve.coffee'
  ins.disconnect()
