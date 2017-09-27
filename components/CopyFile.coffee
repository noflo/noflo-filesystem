fs = require 'fs'
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'copy'
  c.description = 'Copy a file'

  c.inPorts.add 'source',
    datatype: 'string'
  c.inPorts.add 'destination',
    datatype: 'string'
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  noflo.helpers.WirePattern c,
    in: ['source', 'destination']
    out: 'out'
    forwardGroups: true
    async: true
  , (data, groups, out, callback) ->
    handleError = (err) ->
      if err.code is 'EMFILE'
        # TODO: How to postpone with WirePattern?
        # https://github.com/noflo/noflo/issues/203
        return callback err
      callback err

    rs = fs.createReadStream data.source
    ws = fs.createWriteStream data.destination
    rs.on 'error', handleError
    ws.on 'error', handleError

    rs.pipe ws
    rs.on 'end', ->
      out.send data.destination
      do callback
