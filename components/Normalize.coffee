path = require 'path'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'font'
  c.description = 'normalize a path'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path to normalize'
  c.outPorts.add 'out',
    datatype: 'string'
  c.process (input, output) ->
    return unless input.hasData 'in'
    data = input.getData 'in'
    output.sendDone
      out: path.normalize data
