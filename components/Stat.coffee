# The Stat component receives a path on the source port, and
# sends a stats object describing that path to the out port. In case
# of errors the error message will be sent to the error port.

fs = require "fs"
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'search'
  c.description = 'Read statistics of a file'

  c.inPorts.add 'in',
    datatype: 'string'
    description: 'File path'
  c.outPorts.add 'out',
    datatype: 'string'
    required: false
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  noflo.helpers.WirePattern c,
    in: ['in']
    out: 'out'
    forwardGroups: true
    async: true
  , (path, groups, out, callback) ->
    fs.stat path, (err, stats) ->
      return callback err if err
      stats.path = path
      for func in [
        "isFile"
        "isDirectory"
        "isBlockDevice"
        "isCharacterDevice"
        "isFIFO"
        "isSocket"
      ]
        stats[func] = stats[func]()
      out.beginGroup path
      out.send stats
      out.endGroup()
      do callback
