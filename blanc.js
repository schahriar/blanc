var eventEmmiter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

//
var gulp = require('gulp');
var gutil = require('gulp-util');
var jade = require('gulp-jade');
var less = require('gulp-less');
var connect = require('gulp-connect');
var autoprefixer = require('gulp-autoprefixer');
var portscanner = require('portscanner')
    //

var herb = require('herb');

var blanc = function(callback) {
    this.config = {
        dest: './'
    }
    eventEmmiter.call(this);
}

util.inherits(blanc, eventEmmiter);

blanc.prototype.init = function(fullPath, dest) {
    if (!fullPath) throw Error('A PATH IS REQUIRED FOR INIT');
    var template = path.resolve(__dirname, './template');

    if(dest) {
        this.config.dest = dest;
        dest = path.resolve(fullPath, dest);
    }
    fs.writeFileSync(path.resolve(fullPath, '.blanc'), JSON.stringify(this.config, null, 2));

    fs.readdir(fullPath, function(error, files) {
        if (error) throw error;

        // Add exception for hidden files & Node related files/directories
        _.remove(files, function(n) {
            if (n.toLowerCase() === 'package.json') return true;
            if (n.toLowerCase() === 'node_modules') return true;
            return n.substring(0, 1) === '.'
        })
        if (files.length !== 0) {
            gutil.log(gutil.colors.cyan("REMOVE"), gutil.colors.yellow(files.join(', ')))
            gutil.log(gutil.colors.red("THIS DIRECTORY MUST BE EMPTY!"));
        } else {
            fs.copy(template, fullPath, function(error) {
                if (error) return console.error(error);
                gutil.log(gutil.colors.yellow("SUCCESSFULLY INITIALIZED"));
            })
        }
    })
}

blanc.prototype.watch = function(directory) {
    var self = this;

    herb.line('~').log('█ ' + gutil.colors.blue('blanc'), gutil.colors.white('running ...')).line('~');

    if (!directory) directory = process.cwd();

    this.config = JSON.parse(fs.readFileSync(path.resolve(directory, '.blanc'), 'utf8')) || this.config;
    this.dest = path.resolve(directory, this.config.dest || '');
    this.directory = directory;

    portscanner.findAPortNotInUse(8080, 9000, '127.0.0.1', function(error, port) {
        if (error) throw error;
        connect.server({
            root: [self.dest || ''],
            livereload: true,
            port: port
        });
    })

    this.autoBuild();
}

blanc.prototype.overwatch = function(source, func) {
    var self = this;

    this[func]();
    gulp.watch(resolve(source, self.directory), function(){
        self[func].apply(self, arguments);
    });
}

blanc.prototype.autoBuild = function() {
    this.overwatch(['./source/*/*', './source/*.jade', './markdown/*/*.md', './markdown/*.md'], 'jadify');
    this.overwatch(['./stylesheets/*.less', './stylesheets/*/*.less'], 'lessify');
    this.overwatch(['./resources/*', './resources/*/*'], 'resourcify');
}

blanc.prototype.reload = function() {
    connect.reload();
}

blanc.prototype.jadify = function() {
    var self = this;
    gulp.src(resolve(['./source/*/*.jade', './source/*.jade', '!./source/layout.jade'], this.directory))
        .pipe(jade({
            locals: {}
        }))
        .pipe(gulp.dest(self.dest))
        .pipe(connect.reload());

    gutil.log(gutil.colors.green('Jade render'), gutil.colors.magenta('complete'));
}

blanc.prototype.lessify = function() {
    var self = this;
    gulp.src(resolve(['./stylesheets/*.less'], self.directory))
        .pipe(less({
            paths: [path.join(self.directory, 'stylesheets', 'includes')]
        }))
        .on('error', gutil.log.bind(gutil, 'Less Error'))
        .pipe(autoprefixer({
            browsers: ['last 5 version'],
            cascade: true
        }))
        .pipe(gulp.dest(path.resolve(self.dest, 'css')))
        .pipe(connect.reload());

    gutil.log(gutil.colors.cyan('Less render'), gutil.colors.magenta('complete'));
}

blanc.prototype.resourcify = function() {
    var self = this;

    // Ignore if dest is in root
    if(self.config.dest == './') return false;
    fs.remove(path.resolve(self.dest, 'resources'), function(error){
        if(error) throw error;
        gulp.src(resolve(['./resources/*', './resources/*/*'], self.directory), { base: './' })
            .pipe(gulp.dest(self.dest))
            .pipe(connect.reload());
        gutil.log(gutil.colors.red('Resource compile'), gutil.colors.magenta('complete'));
    })
}

function resolve(paths, directory) {
    var paths = _.toArray(paths);
    var resolved = [];
    _.each(paths, function(PATH) {
        if (PATH.substring(0, 1) == '!') {
            resolved.push('!' + path.resolve(directory || '', PATH.substring(1)));
        } else {
            resolved.push(path.resolve(directory || '', PATH));
        }
    })
    return resolved;
}

module.exports = blanc;
