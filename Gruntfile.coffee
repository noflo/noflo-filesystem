module.exports = ->
  # Project configuration
  @initConfig
    pkg: @file.readJSON 'package.json'

    # Coding standards
    coffeelint:
      components: ['components/*.coffee']

    # Unit tests
    nodeunit:
      all: ['test/*.coffee']

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-coffeelint'
  @loadNpmTasks 'grunt-contrib-nodeunit'

  @registerTask 'test', ['coffeelint', 'nodeunit']
