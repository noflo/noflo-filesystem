fs = require 'fs'
noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-filesystem'

describe 'ReadFile component', ->
  c = null
  ins = null
  out = null
  err = null

  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'filesystem/ReadFile', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()

  beforeEach  ->
    out = noflo.internalSocket.createSocket()
    err = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
    c.outPorts.error.attach err

  afterEach ->
    c.outPorts.out.detach out
    c.outPorts.error.detach err

  it 'test error reading file', (done) ->
    err.once 'data', (err) ->
      chai.expect(err.code).to.equal 'ENOENT'
      chai.expect(path.basename(err.path)).to.equal 'doesnotexist'
      done()
    ins.send 'doesnotexist'
    ins.disconnect()

  it 'test reading file', (done) ->
    expect = 'begingroup'
    err.once 'data', (err) ->
      done err
    out.once 'begingroup', (group) ->
      chai.expect(expect).to.equal 'begingroup'
      chai.expect(group).to.equal 'components/ReadFile.coffee'
      expect = 'data'
    out.once 'data', (data) ->
      chai.expect(expect).to.equal 'data'
      chai.expect(data.length).to.be.above 0
      expect = 'endgroup'
    out.once 'endgroup', ->
      chai.expect(expect).to.equal 'endgroup'
      done()
    ins.send 'components/ReadFile.coffee'
    ins.disconnect()
