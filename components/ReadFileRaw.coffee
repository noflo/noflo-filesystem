fs = require "fs"
noflo = require "noflo"

class ReadFileRaw extends noflo.AsyncComponent
  description: 'Read a file and send it out as a buffer'
  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'Source file path'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'array'
      error:
        datatype: 'object'
        required: false

    super()

  readBuffer: (fd, position, size, buffer, callback) ->
    fs.read fd, buffer, 0, buffer.length, position, (err, bytes, buffer) =>
      @outPorts.out.send buffer.slice 0, bytes
      position += buffer.length
      if position >= size
        @outPorts.out.endGroup()
        callback null
      @readBuffer fd, position, size, buffer, callback

  doAsync: (filename, callback) ->
    fs.open filename, 'r', (err, fd) =>
      return callback err if err
      
      fs.fstat fd, (err, stats) =>
        return callback err if err

        buffer = new Buffer stats.size
        @outPorts.out.beginGroup filename
        @readBuffer fd, 0, stats.size, buffer, callback

exports.getComponent = -> new ReadFileRaw
