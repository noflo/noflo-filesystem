fs = require 'fs.extra'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'copy'
  c.description = 'Copy a directory tree'

  c.inPorts.add 'from',
    datatype: 'string'
    description: 'Source path'
  c.inPorts.add 'to',
    datatype: 'string'
    description: 'Target path'
  c.outPorts.add 'out',
    datatype: 'string'
  c.outPorts.add 'error',
    datatype: 'object'

  noflo.helpers.WirePattern c,
    in: ['from', 'to']
    out: 'out'
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    fs.copyRecursive data.from, data.to, (err) ->
      return callback err if err
      out.send data.to
      do callback
