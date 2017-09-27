noflo = require 'noflo'
path = require 'path'

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.icon = 'folder'
  c.description = 'Collect file paths to a buffer until released'
  c.inPorts.add 'collect',
    datatype: 'string'
    description: 'File paths to collect'
  c.inPorts.add 'release',
    datatype: 'string'
    description: 'Directory to release'
  c.outPorts.add 'out',
    datatype: 'string'
  c.tearDown = (callback) ->
    delete c.buffers
    delete c.released
    do callback
  c.process (input, output) ->
    c.buffers = {} unless c.buffers
    c.released = [] unless c.released

    releasePacket = (packet) ->
      for group in packet.groups
        output.send
          out: new noflo.IP 'openBracket', group
      output.send
        out: new noflo.IP 'data', packet.data
      for group in packet.groups
        output.send
          out: new noflo.IP 'closeBracket', group
      return

    if input.hasData 'release'
      # Releasing a directory
      release = input.getData 'release'
      if c.released.indexOf(release) isnt -1
        # Already released, skip
        return output.done()
      c.released.push release
      return output.done() unless c.buffers[release]
      for packet in c.buffers[release]
        releasePacket packet
      delete c.buffers[release]
      output.done()
      return

    return unless input.hasStream 'collect'
    collect = input.getStream 'collect'
    groups = []
    for ip in collect
      if ip.type is 'openBracket'
        groups.push ip.data
        continue
      if ip.type is 'data'
        packet =
          data: ip.data
          groups: groups.slice 0
        directory = path.dirname ip.data
        if c.released.indexOf(directory) isnt -1
          # Already released
          releasePacket packet
          continue
        # Add to buffer
        c.buffers[directory] = [] unless c.buffers[directory]
        c.buffers[directory].push packet
        continue
      if ip.type is 'closeBracket'
        groups.pop()
        continue
    output.done()
