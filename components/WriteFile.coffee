fs = require 'fs'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'floppy-o'
  c.description = 'Write a string into a file'

  c.inPorts.add 'in',
    datatype: 'string'
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
    [ filename, data ] = input.getData 'filename', 'in'
    fs.writeFile filename, data, 'utf-8', (err) ->
      return output.done err if err
      output.sendDone
        out: data.filename
