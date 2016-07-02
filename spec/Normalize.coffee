chai = require 'chai'
noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-filesystem'

describe 'Normalize component', ->
  c = null
  ins = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'filesystem/Normalize', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()
  beforeEach ->
    out = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
  afterEach ->
    c.outPorts.out.detach out

  it 'test multiple / path', (done) ->
    out.once 'data', (p) ->
      chai.expect(p).to.equal path.normalize 'spec////Resolve.coffee'
      done()

    ins.send 'spec////Resolve.coffee'
    ins.disconnect()

  it 'test ../ removal', (done) ->
    out.once 'data', (p) ->
      chai.expect(p).to.equal 'Resolve.coffee'
      done()

    ins.send 'spec/../Resolve.coffee'
    ins.disconnect()

  it 'test ../ removal', (done) ->
    out.once 'data', (p) ->
      chai.expect(p).to.equal 'Resolve.coffee'
      done()

    ins.send 'spec/../Resolve.coffee'
    ins.disconnect()

  it 'test ../../ removal', (done) ->
    out.once 'data', (p) ->
      chai.expect(p).to.equal path.normalize 'spec/../../Resolve.coffee'
      done()

    ins.send 'spec/../../Resolve.coffee'
    ins.disconnect()
