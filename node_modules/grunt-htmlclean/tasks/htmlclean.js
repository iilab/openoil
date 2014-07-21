/*
 * grunt-htmlclean
 * https://github.com/anseki/grunt-htmlclean
 *
 * Copyright (c) 2014 anseki
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var htmlclean = require('htmlclean');

  grunt.registerMultiTask('htmlclean', 'Simple and lightweight cleaner for HTML that just removes unneeded whitespaces, line-breaks, comments, etc.', function() {
    var options = this.options();

    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        return grunt.file.read(filepath);
      }).join(grunt.util.linefeed);

      src = htmlclean(src, options);

      // Write the destination file.
      grunt.file.write(f.dest, src);
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
