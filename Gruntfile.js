module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-karma');
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

    /* browser tests */
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true
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
      documentation: {
        command: [
          'node_modules/groc/bin/groc "./src/**/*.js" --out=docs "./README.md"',
          'node_modules/groc/bin/groc "./test/examples/*.js" --out=docs/examples "./test/examples/index.md"'
        ].join(' && ')
      },
      deploy: {
        command: 'npm publish'
      }
    },

    /* retest on change */
    watch: {
      dev: {
        files: ['src/**/*.js', 'test/**/*.js', 'test/**/*.json'],
        tasks: ['browserify','test', 'karma:unit:run']
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
      },
      tests: {
        files: {
          'build/test/f_test.js': ['test/freight_test.js'],
          'build/test/d_test.js': ['test/definition_test.js']
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

  grunt.registerTask('start', ['karma:unit','watch']);
  grunt.registerTask('test', ['jshint', 'mochaTest', 'shell:coverage', 'shell:documentation']);
  grunt.registerTask('build', ['jshint', 'browserify', 'uglify', 'shell:coverage', 'shell:documentation']);
  grunt.registerTask('deploy', ['test', 'build', 'gh-pages', 'shell:deploy']);

};