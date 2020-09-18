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

  c.forwardbrackets =
    source: ['out', 'error']
    destination: ['out', 'error']

  c.process (input, output) ->
    return unless input.hasData 'source', 'destination'
    [ source, destination ] = input.getData 'source', 'destination'
    rs = fs.createReadStream data.source
    ws = fs.createWriteStream data.destination
    rs.on 'error', output.done
    ws.on 'error', output.done

    rs.pipe ws
    rs.on 'end', ->
      output.sendDone
        out: data.destination
