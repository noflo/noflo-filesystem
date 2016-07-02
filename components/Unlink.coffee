fs = require 'fs'
noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component

  c.icon = 'trash'
  c.description = 'Remove a file'

  c.inPorts = new noflo.InPorts
    in:
      datatype: 'string'
      description: 'File path to remove'
  c.outPorts = new noflo.OutPorts
    out:
      datatype: 'string'
      required: false
    error:
      datatype: 'object'
      required: false

  c.process (input, output) ->
    path = input.getData 'in'
    try
      fs.unlink path, (err) =>
        console.log 'did it go here and not in catch?', err.stack if error?
        return output.done err if err?
        c.outPorts.out.send(path)
        output.done()
    catch e
      console.log "did it triggger catch?"
      output.done e
