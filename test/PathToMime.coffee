resolve = require '../components/PathToMime'
socket = require('noflo').internalSocket

setupComponent = ->
  c = resolve.getComponent()
  ins = socket.createSocket()
  out = socket.createSocket()
  c.inPorts.in.attach ins
  c.outPorts.out.attach out
  return [c, ins, out]

exports['test .jpg'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, 'image/jpeg'
    test.done()
  ins.send 'some/path/to/foo.jpg'
  ins.disconnect()

exports['test .JPEG'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, 'image/jpeg'
    test.done()
  ins.send 'some/path/to/FOO.JPEG'
  ins.disconnect()

exports['test .mp4'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, 'video/mp4'
    test.done()
  ins.send 'some/path/to/bar.mp4'
  ins.disconnect()

exports['test .png'] = (test) ->
  [c, ins, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, 'image/png'
    test.done()
  ins.send 'some/path/to/bar.png'
  ins.disconnect()
