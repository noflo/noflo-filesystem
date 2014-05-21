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

    # Unit tests
    nodeunit:
      all: ['test/*.coffee']

  # Grunt plugins used for building
  @loadNpmTasks 'grunt-noflo-manifest'
  @loadNpmTasks 'grunt-coffeelint'
  @loadNpmTasks 'grunt-contrib-nodeunit'

  @registerTask 'test', ['coffeelint', 'noflo_manifest', 'nodeunit']
