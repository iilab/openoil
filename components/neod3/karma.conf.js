'use strict';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    logLevel: config.LOG_INFO,
    browsers: ['PhantomJS'],
    singleRun: false,
    reporters: ['dots'],
    files: [
      'bower_components/d3/d3.js',
      'bower_components/jquery/dist/jquery.js',
      'neod3.js',
      'build/spec/*.js'
    ]
  });
};
