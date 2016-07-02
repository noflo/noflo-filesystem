# The ReadDir component receives a directory path on the source port, and
# sends the paths of all the files in the directory to the out port. In case
# of errors the error message will be sent to the error port.

fs = require 'fs'
noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component

  c.icon = 'folder-open'
  c.description = 'Get a list of file paths inside a directory'
  c.inPorts = new noflo.InPorts
    source:
      datatype: 'string'
      description: 'Directory path to read'
  c.outPorts = new noflo.OutPorts
    out:
      datatype: 'string'
    error:
      datatype: 'object'

  c.forwardBrackets =
    source: ['out']

  c.ordered = true
  c.autoOrdering = false
  c.process (input, output) ->
    path = input.getData 'source'

    fs.readdir path, (err, files) =>
      return output.done err if err
      path = path.slice(0,-1) if path.slice(-1) == '/'
      sortedFiles = files.sort()
      c.outPorts.out.beginGroup path
      c.outPorts.out.send "#{path}/#{f}" for f in sortedFiles
      c.outPorts.out.endGroup()
      output.done()
