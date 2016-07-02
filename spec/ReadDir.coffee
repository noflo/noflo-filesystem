fs = require 'fs'
chai = require 'chai'
noflo = require 'noflo'

unless noflo.isBrowser()
  chai = require 'chai'
  path = require 'path'
  baseDir = path.resolve __dirname, '../'
else
  baseDir = 'noflo-filesystem'

describe 'ReadDir component', ->
  c = null
  ins = null
  out = null
  err = null
  src = null
  before (done) ->
    @timeout 4000
    loader = new noflo.ComponentLoader baseDir
    loader.load 'filesystem/ReadDir', (err, instance) ->
      return done err if err
      c = instance
      src = noflo.internalSocket.createSocket()
      c.inPorts.source.attach src
      fs.mkdir 'spec/testdir', ->
      fs.writeFile 'spec/testdir/a', 'a', ->
        fs.writeFile 'spec/testdir/b', 'b', ->
          setTimeout done, 1000

  after (done) ->
    fs.unlink 'spec/testdir/b', ->
      fs.unlink 'spec/testdir/a', ->
        fs.rmdir 'spec/testdir', done

  beforeEach ->
    out = noflo.internalSocket.createSocket()
    err = noflo.internalSocket.createSocket()
    c.outPorts.out.attach out
    c.outPorts.error.attach err

  afterEach ->
    c.outPorts.out.detach out

  it 'test error reading dir', (done) ->
    err.once 'data', (err) ->
      chai.expect(err.code).to.equal 'ENOENT'
      chai.expect(path.basename(err.path)).to.equal 'doesnotexist'
      done()

    src.send 'doesnotexist'
    src.disconnect()

  it 'test reading dir', (done) ->
    @timeout 5000
    expect = ['spec/testdir/a','spec/testdir/b']
    err.once 'data', (err) ->
      done err
    out.on 'data', (data) ->
      chai.expect(data).to.equal expect.shift()
      done() if expect.length is 0

    src.send 'spec/testdir'
    src.disconnect()

  it 'test reading dir with slash', (done) ->
    @timeout 5000
    expect = ['spec/testdir/a','spec/testdir/b']
    err.once 'data', (err) ->
      done err
    out.on 'data', (data) ->
      chai.expect(data).to.equal expect.shift()
      done() if expect.length is 0

    src.send 'spec/testdir/'
    src.disconnect()
