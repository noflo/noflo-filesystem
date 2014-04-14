fs = require 'fs'
noflo = require 'noflo'

class Unlink extends noflo.AsyncComponent
  icon: 'trash'
  constructor: ->
    @inPorts =
      in: new noflo.Port 'string'
    @outPorts =
      out: new noflo.Port 'string'
      error: new noflo.Port 'object'
    super()

  doAsync: (path, callback) ->
    fs.unlink(path, (err) =>
      return callback err if err?
      return unless @outPorts.out.isAttached()
      @outPorts.out.send(path)
      @outPorts.out.disconnect())

exports.getComponent = -> new Unlink
