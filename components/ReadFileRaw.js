/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require("fs");
const noflo = require("noflo");

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Read a file and send it out as a buffer';
  c.inPorts.add('in', {
    datatype: 'string',
    description: 'Source file path'
  }
  );
  c.outPorts.add('out',
    {datatype: 'buffer'});
  c.outPorts.add('error', {
    datatype: 'object',
    required: false
  }
  );

  var readBuffer = (fd, position, size, buffer, output, callback) => fs.read(fd, buffer, 0, buffer.length, position, function(err, bytes, buffer) {
    if (err) {
      callback(err);
      return;
    }
    output.send({
      out: buffer.slice(0, bytes)});
    position += buffer.length;
    if (position >= size) {
      output.sendDone({
        out: new noflo.IP('closeBracket')});
      return callback(null);
    }
    return readBuffer(fd, position, size, buffer, out, callback);
  });


  return c.process(function(input, output) {
    if (!input.hasData('in')) { return; }
    const filename = input.getData('in');
    return fs.open(filename, 'r', function(err, fd) {
      if (err) { return output.done(err); }
      
      return fs.fstat(fd, function(err, stats) {
        if (err) { return output.done(err); }

        const buffer = new Buffer(stats.size);
        output.send({
          out: new noflo.IP('openBracket', filename)});
        return readBuffer(fd, 0, stats.size, buffer, output, output.done);
      });
    });
  });
};
