var eventEmmiter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

//
var gulp = require('gulp');
var connect = require('gulp-connect');
var portscanner = require('portscanner');
//

var herb = require('herb');

var blanc = function(callback) {
    this.config = {
        dest: './'
    }
    this.log = require('./superlog.js')('█ blanc');
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
            herb.log(herb.cyan("REMOVE"), herb.yellow(files.join(', ')))
            herb.log(herb.red("THIS DIRECTORY MUST BE EMPTY!"));
        } else {
            fs.copy(template, fullPath, function(error) {
                if (error) return console.error(error);
                herb.log(herb.yellow("SUCCESSFULLY INITIALIZED"));
            })
        }
    })
}

blanc.prototype.watch = function(directory) {
    var self = this;

    self.log.header('ready!');

    if (!directory) directory = process.cwd();

    // Checks if .blanc file exists
    if(!fs.existsSync(path.resolve(directory, '.blanc'))) {
        this.log.error('.blanc');
        return herb.error('.blanc file does not exists! Run', herb.magenta('blanc fix or blanc init'));
    }

    try {
        this.config = JSON.parse(fs.readFileSync(path.resolve(directory, '.blanc'), 'utf8')) || this.config;
        this.dest = path.resolve(directory, this.config.dest || '');
        this.directory = directory;
    }catch(e) {
        this.log.error('.blanc');
        return herb.error('.blanc file seems to be corrupted! Run', herb.magenta('blanc fix'));
    }

    portscanner.findAPortNotInUse(8080, 9000, '127.0.0.1', function(error, port) {
        if (error) throw error;
        connect.server({
            root: [self.dest || ''],
            livereload: true,
            port: port
        });
    })

    this.autoOverwatch();
}

// Automatically overwatches default paths
/// This function is separated from WATCH mainly for API purposes
blanc.prototype.autoOverwatch = function() {
    this.overwatch(['./source/*/*', './source/*', './markdown/*/*.md', './markdown/*.md'], 'jadify');
    this.overwatch(['./stylesheets/*.less', './stylesheets/*/*.less'], 'lessify');
    this.overwatch(['./resources/*', './resources/*/*'], 'resourcify');
}

/*
// Resolves and Watches an Array of paths for changes
// *func* is called on change
*/
blanc.prototype.overwatch = function(source, func) {
    var self = this;

    this[func]();
    gulp.watch(self.resolve(source), function(){
        self[func].apply(self, arguments);
    });
}

/*
// Resolves an Array of paths to the project directory
*/
blanc.prototype.resolve = function(paths) {
    var paths = _.toArray(paths);
    var resolved = [];
    _.each(paths, function(PATH) {
        if (PATH.substring(0, 1) == '!') {
            resolved.push('!' + path.resolve(this.directory || '', PATH.substring(1)));
        } else {
            resolved.push(path.resolve(this.directory || '', PATH));
        }
    })
    return resolved;
}
// Reloads development server (livereload)
blanc.prototype.reload = connect.reload;

//// MODULES ////
blanc.prototype.jadify = require('./modules/jadify');
blanc.prototype.lessify = require('./modules/lessify');
blanc.prototype.resourcify = require('./modules/resourcify');
//// ------ ////

module.exports = blanc;
