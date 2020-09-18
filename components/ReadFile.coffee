# The ReadFile component receives a filename on the in port, and
# sends the contents of the specified file to the out port. The filename
# is used to create a named group around the file contents data. In case
# of errors the error message will be sent to the error port.

fs = require "fs"
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Read a file and send it out as a string'
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
    required: false

  c.process (input, output) ->
    return unless input.hasData 'in'
    fileName = input.getData 'in'
    encoding = input.getData 'encoding'
    fs.readFile fileName, encoding, (err, data) ->
      if err
        output.done err
        return
      output.send
        out: new noflo.IP 'openBracket', fileName
      output.send
        out: data
      output.sendDone
        out: new noflo.IP 'closeBracket', fileName
