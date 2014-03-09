path = require 'path'
noflo = require "noflo"

class ExtName extends noflo.Component
  icon: 'file'
  constructor: ->
    @inPorts =
      in: new noflo.Port 'string'
    @outPorts =
      out: new noflo.Port 'string'

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group

    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send path.extname data

    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()

    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

exports.getComponent = -> new ExtName
