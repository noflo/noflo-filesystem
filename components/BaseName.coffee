path = require 'path'
noflo = require "noflo"

class BaseName extends noflo.Component
  icon: 'file'
  description: 'Get the base name of the file'
  constructor: ->
    @ext = ''
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'File path'
      ext:
        datatype: 'string'
        description: 'Extension, if any'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'

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
