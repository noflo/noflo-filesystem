fs = require "fs"
noflo = require "noflo"

exports.getComponent = ->
  component = new noflo.Component

  c.description = 'Just like ReadFile, but blocks until content is read'
  c.encoding = 'utf-8'
  c.inPorts = new noflo.InPorts
    in:
      datatype: 'string'
      description: 'Source file path'
    encoding:
      datatype: 'string'
      description: 'File encoding'
      default: 'utf-8'
  c.outPorts = new noflo.OutPorts
    out:
      datatype: 'string'
    error:
      datatype: 'object'
      required: false

  c.forwardBrackets =
    in: ['out', 'error']
    encoding: ['out', 'error']

  c.process (input, output) ->
    return unless input.has 'in', 'encoding'

    filename = input.getData 'in'
    encoding = input.getData 'encoding'

    try
      content = fs.readFileSync filename, encoding
    catch e
      c.outPorts.error.send e
      c.outPorts.error.disconnect()
    c.outPorts.out.beginGroup filename
    c.outPorts.out.send content
    c.outPorts.out.endGroup()
