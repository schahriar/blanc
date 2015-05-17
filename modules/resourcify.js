var fs = require('fs-extra');
var path = require('path');
var gulp = require('gulp');
var plumber = require('gulp-plumber');

module.exports = function() {
    var self = this;

    // Ignore if dest is in root
    if(self.config.dest == './') return false;
    fs.remove(path.resolve(self.dest, 'resources'), function(error){
        if(error) throw error;
        gulp.src(self.resolve(['./resources/*', './resources/*/*'], self.directory), { base: './' })
            .pipe(plumber(function(error) {
                self.log.error(error.plugin, error.code);
                self.log.plumb(error.message);
                this.emit('end');
            }))
            .pipe(gulp.dest(self.dest))
            .pipe(self.reload());
        self.log.task('Resource compile', 'complete');
    })
}
