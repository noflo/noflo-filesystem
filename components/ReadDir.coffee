# The ReadDir component receives a directory path on the source port, and
# sends the paths of all the files in the directory to the out port. In case
# of errors the error message will be sent to the error port.

fs = require "fs"
noflo = require "noflo"

class ReadDir extends noflo.AsyncComponent
  icon: 'folder-open'
  description: 'Get a list of file paths inside a directory'
  constructor: ->
    @inPorts = new noflo.InPorts
      source:
        datatype: 'string'
        description: 'Directory path to read'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'
      error:
        datatype: 'object'
        required: 'false'
    super 'source'

  doAsync: (path, callback) ->
    fs.readdir path, (err, files) =>
      return callback err if err
      path = path.slice(0,-1) if path.slice(-1) == "/"
      sortedFiles = files.sort()
      @outPorts.out.beginGroup path
      @outPorts.out.send "#{path}/#{f}" for f in sortedFiles
      @outPorts.out.endGroup()
      callback null

exports.getComponent = -> new ReadDir
