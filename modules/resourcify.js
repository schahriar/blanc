var fs = require('fs-extra');
var path = require('path');
var gulp = require('gulp');
var plumber = require('gulp-plumber');

module.exports = function() {
    var self = this;

    // Ignore recopying to the same path
    if(self.dest === self.directory) return false;

    gulp.src(self.resolve(['./resources/*', './resources/*/*'], self.directory), { base: self.directory })
        .pipe(plumber(function(error) {
            self.log.error(error.plugin, error.code);
            self.log.plumb(error.message);
            this.emit('end');
        }))
        .pipe(self.event('resource:start'))
        .pipe(gulp.dest(self.dest))
        .pipe(self.reload())
        .pipe(self.event('resource:done'));

    self.log.task('Resource', 'compile', 'complete');
}
