path = require 'path'
noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'font'
  c.description = 'Resolve a relative path to an absolute one'
  c.inPorts = new noflo.InPorts
    in:
      datatype: 'string'
      description: 'Path to resolve'
  c.outPorts = new noflo.OutPorts
    out:
      datatype: 'string'

  c.process (input, output) ->
    data = input.getData 'in'
    c.outPorts.out.send path.resolve data
