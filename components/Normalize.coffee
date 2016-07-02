path = require 'path'
noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component

  c.icon = 'font'
  c.description = 'Normalize a path'
  c.inPorts = new noflo.InPorts
    in:
      datatype: 'string'
      description: 'File path to normalize'
  c.outPorts = new noflo.OutPorts
    out:
      datatype: 'string'
      required: false

  c.process (input, output) ->
    data = input.getData 'in'
    c.outPorts.out.send path.normalize data
    output.done()
