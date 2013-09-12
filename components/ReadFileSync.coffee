fs = require "fs"
noflo = require "noflo"

class ReadFileSync extends noflo.Component
  description: 'Just like ReadFile, but blocks until content is read'

  constructor: ->
    @encoding = 'utf-8'

    @inPorts =
      in: new noflo.Port
      encoding: new noflo.Port
    @outPorts =
      out: new noflo.Port
      error: new noflo.Port

    @inPorts.encoding.on 'data', (@encoding) =>

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group

    @inPorts.in.on 'data', (filename) =>
      try
        @outPorts.out.send fs.readFileSync filename, @encoding
      catch e
        if @outPorts.error.isAttached()
          @outPorts.error.send e
          @outPorts.error.disconnect()

    @inPorts.in.on 'endgroup', (group) =>
      @outPorts.out.endGroup()

    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

exports.getComponent = -> new ReadFileSync
