# The ReadDir component receives a directory path on the source port, and
# sends the paths of all the files in the directory to the out port. In case
# of errors the error message will be sent to the error port.

fs = require "fs"
noflo = require "noflo"
path = require 'path'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'folder-open'
  c.description = 'Get a list of file paths inside a directory'
  c.inPorts.add 'source',
    datatype: 'string'
    description: 'Directory path to read'
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  c.process (input, output) ->
    return unless input.hasData 'source'
    dirPath = input.getData 'source'
    fs.readdir dirPath, (err, files) ->
      if err
        output.done err
        return
      sortedFiles = files.sort()
      output.send
        out: new noflo.IP 'openBracket', dirPath
      for f in sortedFiles
        output.send
          out: path.join dirPath, f
      output.sendDone
        out: new noflo.IP 'closeBracket', dirPath
