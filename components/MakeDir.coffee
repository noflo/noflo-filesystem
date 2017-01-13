fs = require 'fs'
path = require 'path'
noflo = require 'noflo'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'folder'
  c.description = 'Create a directory'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'Directory path to create'
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  mkdir = (dirPath, callback) ->
    orig = dirPath
    dirPath = path.resolve dirPath

    # Try creating it
    fs.mkdir dirPath, (err) ->
      # Directory was created
      return callback null unless err

      if err.code is 'ENOENT'
        # Parent missing, create
        mkDir path.dirname(dirPath), (err) ->
          return callback err if err
          mkDir dirPath, callback
        return
      # Check if the directory actually exists already
      fs.stat dirPath, (statErr, stat) ->
        return callback err if statErr
        unless stats.isDirectory()
          return callback new Error "#{dirPath} is not a directory"
        callback null

  noflo.helpers.WirePattern c,
    forwardGroups: true
    async: true
  , (dirPath, groups, out, callback) ->
    mkDir dirPath, (err) ->
      return callback err if err
      out.send dirPath
      do callback
