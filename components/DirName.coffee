path = require 'path'
noflo = require "noflo"

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'folder'
  c.description = 'Get the directory path of a file path'

  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path'
  c.outPorts.add 'out',
    datatype: 'string'

  noflo.helpers.WirePattern c,
    in: ['in']
    out: 'out'
    forwardGroups: true
  , (data, groups, out) ->
    out.send path.dirname data

  c
