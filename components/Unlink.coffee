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

  noflo.helpers.WirePattern c,
    forwardGroups: true
    async: true
  , (path, groups, out, callback) ->
    fs.unlink path, (err) ->
      return callback err if err
      out.send path
      callback null
