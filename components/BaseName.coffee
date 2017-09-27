path = require 'path'
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'file'
  c.description = 'Get the base name of the file'

  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path'
  c.inPorts.add 'ext',
    datatype: 'string'
    description: 'Extension, if any'
    required: false
  c.outPorts.add 'out',
    datatype: 'string'

  noflo.helpers.WirePattern c,
    in: ['in']
    params: ['ext']
    out: 'out'
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    ext = c.params.ext or ''
    out.send path.basename data, ext
    do callback
