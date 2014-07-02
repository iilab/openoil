"use strict"
module.exports = (grunt) ->
  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks
  grunt.initConfig
    karma:
      unit:
        configFile: "karma.conf.js"
        singleRun: true

    clean: ['build']

    coffee:
      options:
        bare: true
        force: true

      build:
        expand: true
        cwd: 'src'
        src: ['**/*.coffee']
        dest: 'build'
        ext: '.js'

      test:
        files: [
          expand: true
          cwd: "spec"
          src: "*.coffee"
          dest: "build/spec"
          ext: ".js"
        ]

    concat:
      options:
        banner: """
        'use strict';
        (function(){

        """
        footer: """

        }());
        """
      dev:
        src: ['build/neod3.js','build/components/*.js',  'build/utils/*.js', 'build/init.js']
        dest: 'example/neod3.js'
      dist:
        src: ['build/neod3.js','build/components/*.js',  'build/utils/*.js', 'build/init.js']
        dest: 'neod3.js'

    connect:
      server:
        options:
          port: 4567
          base: 'example'
          hostname: '*'


    watch:
      scripts:
        files: ['src/**/*.coffee', 'spec/*.coffee']
        tasks: ['build', 'karma']

    uglify:
      dist:
        files:
          "neod3.min.js": "neod3.js"

  grunt.registerTask "build", [
    "clean"
    "coffee"
    "concat"
  ]
  grunt.registerTask "test", [
    "build"
    "karma"
  ]
  grunt.registerTask "dist", [
    "test"
    "uglify"
  ]
  grunt.registerTask "default", ["dist"]

  grunt.registerTask "server", [
    "build"
    "connect"
    "watch"
  ]

  return
