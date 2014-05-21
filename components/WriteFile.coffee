fs = require 'fs'
noflo = require 'noflo'

class WriteFile extends noflo.AsyncComponent
  icon: 'floppy-o'
  description: 'Write a string into a file'
  constructor: ->
    @filename = null

    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'Contents to write'
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

    @inPorts.filename.on 'data', (@filename) =>
    super()

  doAsync: (data, callback) ->
    return callback new Error 'No filename provided' unless @filename
    fs.writeFile @filename, data, 'utf-8', (err) =>
      return callback err if err
      @outPorts.out.send @filename
      do callback

exports.getComponent = -> new WriteFile
