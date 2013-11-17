module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-shell');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    /* tests */
    mochaTest: {
      test: {
        options: {
          require: ['should', 'sinon']
        },
        src: ['test/**/*.js']
      }
    },

    /* test coverage */
    shell: {                    
      coverage: {                     
        options: {                    
          stdout: true
        },
        command: 'istanbul cover --dir=docs/coverage _mocha -- --require="should" --require="sinon"'
      },
      coverall: {
        options: {                    
          stdout: true 
        },
        command: 'cat ./docs/coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js'
      },
      documentation: {

        command: [
          'node_modules/groc/bin/groc "./src/**/*.js" --out=docs "./README.md"',
          'node_modules/groc/bin/groc "./test/examples/*.js" --out=docs/examples "./test/examples/index.md"'
        ].join(' && ')

      }
    },

    /* retest on change */
    watch: {
      dev: {
        files: ['src/**/*.js', 'test/**/*.js', 'test/**/*.json'],
        tasks: ['test']
      },
    },


    //publish docs to pages
    'gh-pages': {
      options: {
        base: 'docs'
      },
      src: ['**']
    },

    /* include commonjs */
    browserify: {
      dev: {
        files: {
          'build/freight.js': ['index.js'],
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
  grunt.registerTask('test', ['jshint', 'mochaTest', 'shell:coverage', 'shell:documentation']);
  grunt.registerTask('build', ['jshint', 'browserify', 'uglify', 'shell:coverage', 'shell:documentation', 'shell:coverall']);
  grunt.registerTask('deploy', ['test', 'build', 'gh-pages']);

};