fs = require 'fs'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'floppy-o'
  c.description = 'Write a buffer into a file'

  c.inPorts.add 'in',
    datatype: 'buffer'
    description: 'Contents to write'
  c.inPorts.add 'filename',
    datatype: 'string'
    description: 'File path to write to'
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  noflo.helpers.WirePattern c,
    in: ['in', 'filename']
    out: 'out'
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    fs.writeFile data.filename, data.in, (err) ->
      return callback err if err
      out.send data.filename
      do callback
