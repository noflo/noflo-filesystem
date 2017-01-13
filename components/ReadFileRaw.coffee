fs = require "fs"
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Read a file and send it out as a buffer'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'Source file path'
  c.outPorts.add 'out',
    datatype: 'buffer'
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  readBuffer = (fd, position, size, buffer, out, callback) ->
    fs.read fd, buffer, 0, buffer.length, position, (err, bytes, buffer) ->
      return callback err if err
      out.send buffer.slice 0, bytes
      position += buffer.length
      if position >= size
        out.endGroup()
        return callback null
      readBuffer fd, position, size, buffer, out, callback

  noflo.helpers.WirePattern c,
    forwardGroups: true
    async: true
  , (filename, groups, out, callback) ->
    fs.open filename, 'r', (err, fd) ->
      return callback err if err
      
      fs.fstat fd, (err, stats) ->
        return callback err if err

        buffer = new Buffer stats.size
        out.beginGroup filename
        readBuffer fd, 0, stats.size, buffer, out, callback
