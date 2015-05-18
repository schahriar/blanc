var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');

module.exports = function() {
    var self = this;

    gulp.src(self.resolve(['./stylesheets/*.less']))
        .pipe(plumber(function(error) {
            self.log.error(error.plugin, error.code);
            self.log.plumb(error.message);
            this.emit('end');
        }))
        .pipe(less({
            paths: [path.join(self.directory, 'stylesheets', 'includes')]
        }))
        .pipe(autoprefixer({
            browsers: ['last 5 version'],
            cascade: true
        }))
        .pipe(gulp.dest(path.resolve(self.dest, 'css')))
        .pipe(self.reload());

    self.log.task('Less', 'render', 'complete');
}
