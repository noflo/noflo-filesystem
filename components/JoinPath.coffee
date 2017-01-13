path = require 'path'
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Join a directory path with a file path'

  c.inPorts.add 'directory',
    datatype: 'string'
    description: 'Directory path'
    required: true
  c.inPorts.add 'file',
    datatype: 'string'
    description: 'File path'
    required: true
  c.outPorts.add 'out',
    datatype: 'string'

  noflo.helpers.WirePattern c,
    in: ['directory', 'file']
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    out.send path.join data.directory, data.file
    do callback
