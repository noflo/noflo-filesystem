fs = require 'fs'
noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-filesystem'

describe 'Stat component', ->
  c = null
  ins = null
  err = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'filesystem/Stat', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()
  beforeEach  ->
    err = noflo.internalSocket.createSocket()
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
    c.outPorts.error.attach err

  afterEach ->
    c.outPorts.out.detach out
    c.outPorts.error.detach err

  it 'test stat nonexistent path', (done) ->
    err.once 'data', (err) ->
      chai.expect(err.code).to.equal 'ENOENT'
      chai.expect(path.basename(err.path)).to.equal 'doesnotexist'
      done()

    ins.send 'doesnotexist'
    ins.disconnect()

  it 'test stat file', (done) ->
    err.once 'data', (err) ->
      done err
    out.once 'data', (stats) ->
      chai.expect(stats.path).to.equal 'spec/Stat.coffee'
      chai.expect(stats.isFile).to.be.true
      chai.expect(stats).to.have.property 'uid'
      chai.expect(stats).to.have.property 'mode'
      chai.expect(stats).to.have.property 'ctime'
      done()

    ins.send 'spec/Stat.coffee'
    ins.disconnect()

  it 'test stat dir', (done) ->
    err.once 'data', (err) ->
      done err
    out.once 'data', (stats) ->
      chai.expect(stats.path).to.equal 'spec'
      chai.expect(stats.isDirectory).to.be.true

      chai.expect(stats).to.have.property 'uid'
      chai.expect(stats).to.have.property 'mode'
      chai.expect(stats).to.have.property 'ctime'
      done()
    ins.send 'spec'
