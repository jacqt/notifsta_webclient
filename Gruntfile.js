module.exports = function(grunt) {
    "use strict";
    grunt.initConfig({
        meta: {
            version: '0.1.0'
        },

        clean: {
            build: ["dist", ".tmp"]
        },

        useminPrepare: {
            html: 'index.html',
        },

        usemin: {
            html: ['dist/index.html', 'dist/templates.js']
        },

        // TODO: Enable to lint for high quality code.
        //jshint: {
        //    options: {
        //        camelcase: true,
        //        curly: true,
        //        eqeqeq: true,
        //        immed: true,
        //        latedef: true,
        //        newcap: true,
        //        noarg: true,
        //        undef: true,
        //        //unused: true,
        //        forin: true,
        //        unused: 'vars',
        //        browser: true,
        //        indent: 4,
        //        freeze: true,
        //        nonbsp: true,
        //        quotmark: false,
        //        strict: true,
        //        trailing: true,
        //        maxerr: 5,
        //        globals: {Ext: false, mater: true}
        //    },
        //    gruntfile: {
        //        src: 'Gruntfile.js'
        //    },
        //    app: {
        //        src: ['app.js', 'app/**/*.js', 'resources/js/timeseal.js'], //'app-test/*.js']
        //    },
        //    tests: {
        //        src: ['Gruntfile.js', 'app-test/*.js'],
        //        options: {
        //            strict: false,
        //            indent: false,
        //            globals: {describe: false, it: false, expect: false, Ext: false,
        //                mater: true}
        //        }
        //    }
        //},

        concat: {
            options: {
                separator: ';\n'
            }
        },

        uglify: {
            options: {
                report: 'min',
                mangle: false,
//                mangle: {
//                    except: ['Angular', 'jQuery']
//                },
                beautify: {
                    ascii_only: false
                }
            }
        },

        ngtemplates: {
            notifsta: {
                src: ['app/**/*.html', 'app/**/*.json'],
                dest: 'dist/templates.js',
                options: {
                    usemin: 'dist/app.js',
                },
            },
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            }
        },

        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            notifsta: {
                files: {
                    src: ['dist/app.js'],
                },
            },
        }
    });

    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', [
        'useminPrepare',
        'ngtemplates',
        'concat:generated',
        'ngAnnotate',
        'cssmin:generated',
        'uglify:generated',
        'usemin'
    ]);
};

// vim: expandtab tabstop=4 softtabstop=4 shiftwidth=4 smarttab autoindent
