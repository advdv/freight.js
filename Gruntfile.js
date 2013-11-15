module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-uglify'); 
  grunt.loadNpmTasks('grunt-contrib-jshint'); 
  grunt.loadNpmTasks('grunt-browserify'); 
  grunt.loadNpmTasks('grunt-contrib-watch');  
  grunt.loadNpmTasks('grunt-simple-mocha');  


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /* tests */
    simplemocha: {
      options: {},
      all: { src: 'test/**/*.js' }
    },

    /* retest on change */
    watch: {
      dev: {
        files: ['src/**/*.js', 'test/**/*.js'],
        tasks: ['test']
      },
    },

    /* include commonjs */
    browserify: {
      dev: {
        files: {
          'build/freight.js': ['src/index.js'],
        }
      }
    },

    /* js hint */
    jshint: {
      options: {
        jshintrc: './.jshintrc',
      },
      files: ['src/**/*.js']
    },

    /* minify js */
    uglify: {
      options: {
        report: 'gzip'
      },
      dist: {
        files: {
          'build/freight.min.js': ['build/freight.js']
        }
      }
    }

  });

  grunt.registerTask('default', ['test', 'build']);

  grunt.registerTask('start', ['watch']);
  grunt.registerTask('test', ['jshint', 'simplemocha']);
  grunt.registerTask('build', ['jshint', 'browserify', 'uglify']);

};