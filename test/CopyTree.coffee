readenv = require "../components/CopyTree"
socket = require('noflo').internalSocket

setupComponent = ->
  c = readenv.getComponent()
  from = socket.createSocket()
  to = socket.createSocket()
  out = socket.createSocket()
  err = socket.createSocket()
  c.inPorts.from.attach from
  c.inPorts.to.attach to
  c.outPorts.out.attach out
  c.outPorts.error.attach err
  [c, from, to, out, err]

exports['test component instantiation'] = (test) ->
  [c, from, to, out, err] = setupComponent()

  test.ok from
  test.done()
