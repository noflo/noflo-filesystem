join = require '../components/JoinPath'
path = require 'path'
socket = require('noflo').internalSocket

setupComponent = ->
  c = join.getComponent()
  directory = socket.createSocket()
  file = socket.createSocket()
  out = socket.createSocket()
  c.inPorts.directory.attach directory
  c.inPorts.file.attach file
  c.outPorts.out.attach out
  return [c, directory, file, out]

exports['test path joining'] = (test) ->
  [c, directory, file, out] = setupComponent()
  out.once 'data', (p) ->
    test.equal p, __filename
    test.done()
  directory.send __dirname
  file.send 'JoinPath.coffee'
