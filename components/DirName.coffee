path = require 'path'
noflo = require "noflo"

class DirName extends noflo.Component
  icon: 'folder'
  description: 'Get the directory path of a file path'
  constructor: ->
    @inPorts = new noflo.InPorts
      in:
        datatype: 'string'
        description: 'File path'
    @outPorts = new noflo.OutPorts
      out:
        datatype: 'string'

    @inPorts.in.on 'begingroup', (group) =>
      @outPorts.out.beginGroup group

    @inPorts.in.on 'data', (data) =>
      @outPorts.out.send path.dirname data

    @inPorts.in.on 'endgroup', =>
      @outPorts.out.endGroup()

    @inPorts.in.on 'disconnect', =>
      @outPorts.out.disconnect()

exports.getComponent = -> new DirName
