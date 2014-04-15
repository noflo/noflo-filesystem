resolve = require '../components/Resolve'
socket = require('noflo').internalSocket

setupComponent = ->
  c = resolve.getComponent()
  ins = socket.createSocket()
  out = socket.createSocket()
  c.inPorts.in.attach ins
  c.outPorts.out.attach out
  return [c, ins, out]

exports['test relative path'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (path) ->
    test.equal path[0], '/'
    test.ok true
    test.done()
  ins.send 'test/Resolve.coffee'
  ins.disconnect()
