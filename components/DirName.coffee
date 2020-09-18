path = require 'path'
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'folder'
  c.description = 'Get the directory path of a file path'

  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path'
  c.outPorts.add 'out',
    datatype: 'string'

  c.process (input, output) ->
    output.sendDone
      out: path.dirname input.getData 'in'
