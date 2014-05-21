path = require 'path'
noflo = require 'noflo'

class Resolve extends noflo.Component
  icon: 'font'
  description: 'Resolve a relative path to an absolute one'
  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'Path to resolve'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group
    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send path.resolve data
    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()
    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

exports.getComponent = -> new Resolve
