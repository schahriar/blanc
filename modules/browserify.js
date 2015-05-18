'use strict';

var path = require('path');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var watchify = require('watchify');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

module.exports = function() {
    var self = this;
    var bundle = watchify(browserify(self.resolve(['./javascript/master.js']), watchify.args));

    function rebundle() {
        return bundle.bundle()
            .on('error', function(error) {
                self.log.error("Browserify", 'Script Bundle Failed');
                self.log.plumb(error.message);

                this.emit('end');
            })
            .pipe(plumber(function(error) {
                self.log.error(error.plugin, error.code);
                self.log.plumb(error.message);
                this.emit('end');
            }))
            .pipe(source('./bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(path.resolve(self.dest, 'js')))
            .pipe(self.reload());
    }

    bundle.on('update', rebundle);
    bundle.on('error', function(error) {
        self.log.error(error.plugin, error.code);
        self.log.plumb(error.message);
        this.emit('end');
    })
    bundle.on('time', function(time) {
        self.log.task('Browserify', 'render took', time + 'ms');
    });

    return rebundle();
}
