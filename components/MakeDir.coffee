fs = require 'fs'
path = require 'path'
noflo = require 'noflo'

class MakeDir extends noflo.AsyncComponent
  icon: 'folder'
  description: 'Create a directory'
  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'Directory path to create'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'
        required: false
      error:
        datatype: 'object'
        required: false

    super()

  doAsync: (dirPath, callback) ->
    @mkDir dirPath, (err) =>
      return callback err if err
      @outPorts.out.send dirPath
      callback null

  mkDir: (dirPath, callback) ->
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
          @mkDir path.dirname(dirPath), (err) =>
            return callback err if err
            @mkDir dirPath, callback

        # Check if the directory actually exists already
        else
          fs.stat dirPath, (statErr, stat) ->
            return callback err if statErr
            return callback err unless stat.isDirectory()
            callback null

exports.getComponent = -> new MakeDir
