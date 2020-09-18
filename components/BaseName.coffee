path = require 'path'
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'file'
  c.description = 'Get the base name of the file'

  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path'
  c.inPorts.add 'ext',
    datatype: 'string'
    description: 'Extension, if any'
    control: true
    required: false
  c.outPorts.add 'out',
    datatype: 'string'

  c.process (input, output) ->
    return unless input.hasData 'in'
    ext = ''
    if input.hasData 'ext'
      ext = input.getData 'ext'
    data = input.getData 'in'
    output.sendDone
      out: path.basename data, ext
