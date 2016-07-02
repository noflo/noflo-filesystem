fs = require 'fs'
path = require 'path'
noflo = require 'noflo'

exports.getComponent = ->
  c = new noflo.Component

  c.icon = 'folder'
  c.description = 'Create a directory'
  c.inPorts = new noflo.InPorts
    in:
      datatype: 'string'
      description: 'Directory path to create'
      required: true
  c.outPorts = new noflo.OutPorts
    out:
      datatype: 'string'
      required: false
    error:
      datatype: 'object'
      required: false

  c.mkDir = (dirPath, callback) ->
    orig = dirPath
    dirPath = path.resolve dirPath

    # Try creating it
    fs.mkdir dirPath, (err) =>
      # Directory was created
      unless err
        return callback null

      switch err.code
        # Parent missing, create
        when 'ENOENT'
          c.mkDir path.dirname(dirPath), (err) =>
            return callback err if err
            c.mkDir dirPath, callback

        # Check if the directory actually exists already
        else
          fs.stat dirPath, (statErr, stat) ->
            return callback err if statErr
            return callback err unless stat.isDirectory()
            callback null

  c.process (input, output) ->
    dirPath = input.getData 'in'
    c.mkDir dirPath, (err) =>
      return output.done err if err
      c.outPorts.out.send dirPath
      output.done()
