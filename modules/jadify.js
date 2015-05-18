var fs = require('fs-extra');
var path = require('path');
var path = require('path');
var gulp = require('gulp');
var jade = require('gulp-jade');
var plumber = require('gulp-plumber');
var herb = require('herb');

function readLocals(context) {
    var PATH = path.resolve(context.directory, 'source/_locals.json');
    if(fs.existsSync(PATH)) {
        try {
            return JSON.parse(fs.readFileSync(PATH, 'utf8'));
        }catch(e){
            console.log(herb.bgRed("JadeLocals"), e);
            return new Object;
        }
    }else return new Object;
}

module.exports = function() {
    var self = this;
    gulp.src(self.resolve(['./source/*/*.jade', './source/*.jade', '!./source/layout.jade']))
        .pipe(plumber(function(error) {
            self.log.error(error.plugin, error.code);
            self.log.plumb(error.message);
            this.emit('end');
        }))
        .pipe(jade({
            locals: readLocals(self)
        }))
        .pipe(gulp.dest(self.dest))
        .pipe(self.reload());

    self.log.task('Jade', 'render', 'complete');
}
