path = require 'path'
noflo = require 'noflo'

class Normalize extends noflo.Component
  icon: 'font'
  description: 'Normalize a path'
  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'File path to normalize'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'
        required: false

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group
    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send path.normalize data
    @inPorts.in.on 'endgroup', () =>
      @outPorts.out.endGroup()
    @inPorts.in.on 'disconnect', () =>
      @outPorts.out.disconnect()

exports.getComponent = -> new Normalize
