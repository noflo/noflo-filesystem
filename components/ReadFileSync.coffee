fs = require "fs"
noflo = require "noflo"

class ReadFileSync extends noflo.Component
  description: 'Just like ReadFile, but blocks until content is read'
  constructor: ->
    @encoding = 'utf-8'
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'Source file path'
      encoding:
        datatype: 'string'
        description: 'File encoding'
        default: 'utf-8'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'
      error:
        datatype: 'object'
        required: false

    @inPorts.encoding.on 'data', (@encoding) =>

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group

    @inPorts.in.on 'data', (filename) =>
      try
        content = fs.readFileSync filename, @encoding
      catch e
        @outPorts.error.send e
        @outPorts.error.disconnect()
      @outPorts.out.beginGroup filename
      @outPorts.out.send content
      @outPorts.out.endGroup()

    @inPorts.in.on 'endgroup', (group) =>
      @outPorts.out.endGroup()

    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

exports.getComponent = -> new ReadFileSync
