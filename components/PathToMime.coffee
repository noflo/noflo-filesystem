noflo = require 'noflo'
mimetype = require 'mimetype'

# @runtime noflo-nodejs

# Extra MIME types config
mimetype.set '.markdown', 'text/x-markdown'
mimetype.set '.md', 'text/x-markdown'
mimetype.set '.xml', 'text/xml'

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'files-o'
  c.description = 'Get MIME type based on file path'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path'
  c.outPorts.add 'out',
    datatype: 'string'
    description: 'MIME type'
  c.outPorts.add 'error',
    datatype: 'object'
  c.process (input, output) ->
    return unless input.hasData 'in'
    pathname = input.getData 'in'
    mime = mimetype.lookup pathname
    unless mime
      output.done new Error "No MIME type found for '#{pathname}'"
      return
    output.sendDone
      out: mime
