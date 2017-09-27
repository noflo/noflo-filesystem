noflo = require 'noflo'
mimetype = require 'mimetype'

# @runtime noflo-nodejs

# Extra MIME types config
mimetype.set '.markdown', 'text/x-markdown'
mimetype.set '.md', 'text/x-markdown'
mimetype.set '.xml', 'text/xml'

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'code-fork'
  c.inPorts.add 'routes',
    datatype: 'array'
    control: true
  c.inPorts.add 'in',
    datatype: 'object'
  c.outPorts.add 'out',
    datatype: 'object'
    addressable: true
  c.outPorts.add 'missed',
    datatype: 'object'
  c.forwardBrackets =
    in: ['out', 'missed']
  c.process (input, output) ->
    return unless input.hasData 'routes', 'in'
    [routes, data] = input.getData 'routes', 'in'
    if typeof routes is 'string'
      routes = routes.split ','
    unless data.path
      output.sendDone
        missed: data
      return
    mime = mimetype.lookup data.path
    unless mime
      output.sendDone
        missed: data
      return

    selected = null
    for matcher, id in routes
      selected = id unless mime.indexOf(matcher) is -1
    if selected is null
      output.sendDone
        missed: data
      return
    output.sendDone
      out: new noflo.IP 'data', data,
        index: selected
