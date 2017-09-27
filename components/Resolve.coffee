path = require 'path'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'font'
  c.description = 'Resolve a relative path to an absolute one'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'Path to resolve'
  c.outPorts.add 'out',
    datatype: 'string'
  c.process (input, output) ->
    return unless input.hasData 'in'
    data = input.getData 'in'
    output.sendDone
      out: path.resolve data
