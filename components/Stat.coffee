# The Stat component receives a path on the source port, and
# sends a stats object describing that path to the out port. In case
# of errors the error message will be sent to the error port.

fs = require "fs"
noflo = require "noflo"

class Stat extends noflo.AsyncComponent
  icon: 'search'
  description: 'Read statistics of a file'
  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'File path'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'object'
      error:
        datatype: 'object'
        required: false
    super()

  doAsync: (path, callback) ->
    fs.stat path, (err, stats) =>
      return callback err if err
      stats.path = path
      for func in ["isFile","isDirectory","isBlockDevice",
        "isCharacterDevice", "isFIFO", "isSocket"]
        stats[func] = stats[func]()
      @outPorts.out.beginGroup path
      @outPorts.out.send stats
      @outPorts.out.endGroup()
      callback null

exports.getComponent = -> new Stat()
