fs = require 'fs'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'trash'
  c.description = 'Remove a file'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path to remove'
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  c.process (input, output) ->
    path = input.getData 'in'
    fs.unlink path, (err) ->
      return output.done err if err
      output.sendDone
        out: path
