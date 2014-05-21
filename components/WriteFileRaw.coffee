fs = require 'fs'
noflo = require 'noflo'

class WriteFileRaw extends noflo.AsyncComponent
  icon: 'floppy-o'
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
      out:
        datatype: 'string'
        required: false
      error:
        datatype: 'object'
        required: false

    @inPorts.filename.on "data", (@filename) =>
    super()

  doAsync: (data, callback) ->
    return callback new Error 'No filename provided' unless @filename
    fs.writeFile @filename, data, (err) =>
      return callback err if err
      @outPorts.out.send @filename
      do callback

exports.getComponent = -> new WriteFileRaw
