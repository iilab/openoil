module.exports = function(grunt) {
  grunt.initConfig({
    files: {
      karma_cucumber_files: [
        {pattern: 'test/integration/app.template', watched: false, included: false, served: true},
        {pattern: 'test/integration/features/**/*.feature', watched: true, included: false, served: true},
        {pattern: 'test/integration/features/step_definitions/**/*.js', watched: true, included: true, served: true}
      ],

      jshint: ['elements/**/*.js'],

      watch_js: ['**/*.js']
    },
    watch: {
      //run unit tests with karma (server needs to be already running)
      js: {
        files: "<%= files.watch_js %>",
        tasks: ['default']
      }
    },
    htmlclean: {
      deploy: {
        expand: true,
        src: '/index-concat.html',
        dest: '/dist'
      }
    },
    vulcanize: {
      options: {
        csp: false,
      },
      files: {
        'index-src.html': 'index-concat.html'
      }
    },
    jshint: {
      all: "<%= files.jshint %>",
      options: {
        jshintrc: ".jshintrc"
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js',
        runnerPort: 9999,
        browsers: ['Chrome']
      },
      jasmine: {
        singleRun: true,
        browsers: ['PhantomJS']
      },
      continuous: {
        singleRun: true,
        browsers: ['PhantomJS'],
        files: "<%= files.karma_cucumber_files %>",
        frameworks : ["jasmine", "cucumberjs"]
      },
      dev: {
        reporters: 'dots',
//        background: true,
        singleRun: true,
        files: "<%= files.karma_cucumber_files %>",
        frameworks : ["cucumberjs"]
      }
    }
  });

  // plugins
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-htmlclean');
  grunt.loadNpmTasks('grunt-vulcanize');
  grunt.loadNpmTasks('grunt-karma');

  // tasks
  grunt.registerTask('default', ['jshint', 'karma:jasmine', 'karma:dev', 'vulcanize', 'htmlclean']);
  grunt.registerTask('continuous', ['jshint', 'karma:jasmine', 'karma:continuous', 'vulcanize', 'htmlclean']);
  grunt.registerTask('watch', ['default', 'watch']);
};