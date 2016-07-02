module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # Updating the package manifest files
    noflo_manifest:
      update:
        files:
          'package.json': ['graphs/*', 'components/*']

    # Coding standards
    coffeelint:
      components: ['components/*.coffee']

    # BDD tests on Node.js
    mochaTest:
      nodejs:
        src: ['spec/*.coffee']
        options:
          reporter: 'spec'
          require: 'coffee-script/register'
          grep: process.env.TESTS

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-noflo-manifest'
  @loadNpmTasks 'grunt-coffeelint'
  @loadNpmTasks 'grunt-mocha-test'

  @registerTask 'test', ['coffeelint', 'noflo_manifest', 'mochaTest']
  @registerTask 'default', ['test']
