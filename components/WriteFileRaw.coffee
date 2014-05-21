fs = require 'fs'
noflo = require 'noflo'

class WriteFileRaw extends noflo.AsyncComponent
  icon: 'save'
  description: 'Write a buffer into a file'
  constructor: ->
    @filename = null

    @inPorts = new noflo.InPorts
      in:
        datatype: 'array'
        description: 'Buffer to write'
      filename:
        datatype: 'string'
        description: 'File path to write to'
    @outPorts = new noflo.OutPorts
      filename:
        datatype: 'string'
        required: false
      error:
        datatype: 'object'
        required: false

    @inPorts.filename.on "data", (@filename) =>
    super 'in', 'filename'

  doAsync: (data, callback) ->
    return callback new Error 'No filename provided' unless @filename
    fs.open @filename, 'w', (err, fd) =>
      return callback err if err

      fs.write fd, data, 0, data.length, 0, (err, bytes, buffer) =>
        return callback err if err
        @outPorts.filename.send filename
        do callback

exports.getComponent = -> new WriteFileRaw
