path = require 'path'
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'file'
  c.description = 'Get the file extension for a file path'

  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path'
  c.outPorts.add 'out',
    datatype: 'string'

  noflo.helpers.WirePattern c,
    in: ['in']
    out: 'out'
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    out.send path.extname data
    do callback
