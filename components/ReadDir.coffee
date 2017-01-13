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

  noflo.helpers.WirePattern c,
    in: ['source']
    forwardGroups: true
    async: true
  , (dirPath, groups, out, callback) ->
    fs.readdir dirPath, (err, files) ->
      return callback err if err
      sortedFiles = files.sort()
      out.beginGroup dirPath
      out.send path.join(dirPath, f) for f in sortedFiles
      out.endGroup()
      callback null
