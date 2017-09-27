fs = require "fs"
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Just like ReadFile, but blocks until content is read'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'Source file path'
  c.inPorts.add 'encoding',
    datatype: 'string'
    description: 'File encoding'
    default: 'utf-8'
    control: true
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'

  c.process (input, output) ->
    return unless input.hasData 'in'
    encoding = 'utf-8'
    if input.hasData('encoding')
      encoding = input.getData('encoding')
    filename = input.getData 'in'
    try
      content = fs.readFileSync filename, encoding
    catch e
      return output.done e
    output.sendDone
      out: content
