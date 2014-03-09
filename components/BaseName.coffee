path = require 'path'
noflo = require "noflo"

class BaseName extends noflo.Component
  icon: 'file'
  constructor: ->
    @ext = ''
    @inPorts =
      in: new noflo.Port 'string'
      ext: new noflo.Port 'string'
    @outPorts =
      out: new noflo.Port 'string'

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group

    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send path.basename data, @ext

    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()

    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

    @inPorts.ext.on 'data', (@ext) =>

exports.getComponent = -> new BaseName
