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
        dest: './',
        createdAt: new Date(),
        timeSpent: 0
    }
    this.port = 8080;
    this.idle = 0;
    this.log = require('./superlog.js')('blanc', '█');
    this.setFooter = function(){
        this.log.line('last-3', herb.dim('--------------------------'));
        this.log.line('last-2', herb.cyan('Development Server:'), herb.bgRed(' http://localhost:' + this.port + ' '));
        this.log.line('last-1', herb.cyan('Created on:'), new Date(Date.parse(this.config.createdAt)));
        this.log.line('last', herb.cyan('Development Time:'), (this.config.timeSpent < 60)?this.config.timeSpent + ' minute(s)':Math.round(this.config.timeSpent/60)+' hour(s)');
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

blanc.prototype.watch = function(directory, silent) {
    var self = this;

    self.log.header('ready!');

    // Replace console log
    console.log = console.warn = console.error = function() {
        self.log.addLog.apply(self.log, arguments)
    };

    if (!!silent) self.log.silent();
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
        self.port = port;
        // Update footer
        self.setFooter();
        connect.server({
            root: [self.dest || ''],
            livereload: true,
            port: port
        });
    })

    this.setFooter();
    // Log time spent
    setInterval(function(){
        // Defines a minimum 5 min save time to stop the counter
        if((parseInt(self.idle) === NaN) || (parseInt(self.idle) <= 5)) {
            self.idle += 1;
            self.config.timeSpent += 1;
            self.setFooter();
            // Ignore errors
            fs.writeFile(path.resolve(self.directory, '.blanc'), JSON.stringify(self.config, null, 2), function(error) { });
        }
    }, 60000);

    this.autoOverwatch();
}

// Automatically overwatches default paths
/// This function is separated from WATCH mainly for API purposes
blanc.prototype.autoOverwatch = function() {
    this.overwatch(['./source/*/*', './source/*', './markdown/*/*.md', './markdown/*.md'], 'jadify');
    this.overwatch(['./stylesheets/*.less', './stylesheets/*/*.less'], 'lessify');
    this.overwatch(['./resources/*', './resources/*/*'], 'resourcify');
    this.overwatch(['./javascript/*.js', './javascript/*/*.js'], 'browserify');
}

/*
// Resolves and Watches an Array of paths for changes
// *func* is called on change
*/
blanc.prototype.overwatch = function(source, func) {
    var self = this;

    this[func]();
    gulp.watch(self.resolve(source), function(){
        self.idle = 0;
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
blanc.prototype.browserify = require('./modules/browserify');
//// ------ ////

module.exports = blanc;
