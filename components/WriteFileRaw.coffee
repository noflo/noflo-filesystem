fs = require 'fs'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'floppy-o'
  c.description = 'Write a buffer into a file'

  c.inPorts.add 'in',
    datatype: 'buffer'
    description: 'Contents to write'
  c.inPorts.add 'filename',
    datatype: 'string'
    description: 'File path to write to'
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  c.process (input, output) ->
    return unless input.hasData 'in', 'filename'
    [ filename, buffer ] = input.getData 'filename', 'buffer'
    fs.writeFile filename, buffer, (err) ->
      return output.done err if err
      output.sendDone
        out: data.filename
