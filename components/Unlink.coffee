fs = require 'fs'
noflo = require 'noflo'

class Unlink extends noflo.AsyncComponent
  icon: 'trash'
  description: 'Remove a file'
  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'File path to remove'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'
        required: false
      error:
        datatype: 'object'
        required: false
    super()

  doAsync: (path, callback) ->
    fs.unlink path, (err) =>
      return callback err if err?
      @outPorts.out.send(path)
      callback null

exports.getComponent = -> new Unlink
