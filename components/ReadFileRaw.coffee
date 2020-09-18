fs = require "fs"
noflo = require "noflo"

# @runtime noflo-nodejs

exports.getComponent = ->
  c = new noflo.Component
  c.description = 'Read a file and send it out as a buffer'
  c.inPorts.add 'in',
    datatype: 'string'
    description: 'Source file path'
  c.outPorts.add 'out',
    datatype: 'buffer'
  c.outPorts.add 'error',
    datatype: 'object'
    required: false

  readBuffer = (fd, position, size, buffer, output, callback) ->
    fs.read fd, buffer, 0, buffer.length, position, (err, bytes, buffer) ->
      if err
        callback err
        return
      output.send
        out: buffer.slice 0, bytes
      position += buffer.length
      if position >= size
        output.sendDone
          out: new noflo.IP 'closeBracket'
        return callback null
      readBuffer fd, position, size, buffer, out, callback


  c.process (input, output) ->
    return unless input.hasData 'in'
    filename = input.getData 'in'
    fs.open filename, 'r', (err, fd) ->
      return output.done err if err
      
      fs.fstat fd, (err, stats) ->
        return output.done err if err

        buffer = new Buffer stats.size
        output.send
          out: new noflo.IP 'openBracket', filename
        readBuffer fd, 0, stats.size, buffer, output, output.done
