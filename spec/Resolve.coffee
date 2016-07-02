fs = require 'fs'
noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-filesystem'

describe 'Resolve component', ->
  c = null
  ins = null
  out = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'filesystem/Resolve', (err, instance) ->
      return done err if err
      c = instance
      ins = noflo.internalSocket.createSocket()
      c.inPorts.in.attach ins
      done()
  beforeEach  ->
    out = noflo.internalSocket.createSocket()
    err = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out

  afterEach ->
    c.outPorts.out.detach out

  it 'test relative path', (done) ->
    out.once 'data', (data) ->
      chai.expect(data[0]).to.equal path.resolve('/')[0]
      done()

    ins.send 'test/Resolve.coffee'
    ins.disconnect()
