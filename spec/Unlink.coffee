os = require 'os'
fs = require 'fs'
noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-filesystem'

describe 'Unlink component', ->
  c = null
  ins = null
  err = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'filesystem/Unlink', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()

  after (done) ->
    @timeout 20000
    fs.unlink 'test-unlink-file', ->
      fs.unlink 'test-unlink-file1', ->
        fs.unlink 'test-unlink-file2', ->
          fs.rmdir 'test-unlink-dir', done

  beforeEach  ->
    out = noflo.internalSocket.createSocket()
    err = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
    c.outPorts.error.attach err

  afterEach ->
    c.outPorts.out.detach out

  it 'test unlink dir', (done) ->
    fs.mkdirSync 'test-unlink-dir'
    err.once 'data', (err) ->
      if err.code is 'EPERM'
        chai.expect(err.code).to.equal 'EPERM'
      else if err.code is 'EISDIR'
        chai.expect(err.code).to.equal 'EISDIR'
      else
        done new Error('not a valid erorr')

      chai.expect(path.basename(err.path)).to.equal 'test-unlink-dir'
      done()
    out.once 'data', (path) ->
      done new Error('should not trigger this')
    ins.send 'test-unlink-dir'
    ins.disconnect()

  it 'test unlink file', (done) ->
    fs.writeFileSync 'test-unlink-file', 'TEST'
    err.once 'data', (err) ->
      done err
    out.once 'data', (path) ->
      chai.expect(path).to.equal 'test-unlink-file'
      done()
    ins.send 'test-unlink-file'
    ins.disconnect()

  it 'test unlink more than once', (done) ->
    fs.writeFileSync 'test-unlink-file1', 'TEST'
    fs.writeFileSync 'test-unlink-file2', 'TEST'
    err.once 'data', (err) ->
      done err
    out.once 'data', (path) ->
      chai.expect(path).to.equal 'test-unlink-file1'
      out.once 'data', (path) ->
        chai.expect(path).to.equal 'test-unlink-file2'
        done()
    ins.send 'test-unlink-file1'
    ins.disconnect()
    ins.send 'test-unlink-file2'
    ins.disconnect()
