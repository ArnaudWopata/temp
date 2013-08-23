'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    coffee: {
      compile: {
        files: {
          'js/client_script.js': ['src/*.coffee']
        },
        options: {
          bare: true
        }
      }
    },
    watch: {
      coffee: {
        files: ['src/*.coffee'],
        tasks: ['coffee']
      },
      html: {
        files: ['*.html', 'pages/*.html', 'templates/*.html']
      },
      options: {
        livereload: true,
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['coffee']);
};
