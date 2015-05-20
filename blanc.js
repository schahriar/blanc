var eventEmmiter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash');
var os = require("os");
var path = require('path');

//
var gulp = require('gulp');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var stream = require('event-stream');
//

var herb = require('herb');
var async = require('async');

var blanc = function(silent) {
    this.config = {
        dest: './',
        createdAt: new Date(),
        timeSpent: 0
    }
    this.connect = connect;
    this.port = 8080;
    this.idle = 0;
    this.log = require('./superlog.js')('blanc', '█');
    if(silent) this.log.silent(silent);
    this.setFooter = function(){
        this.log.line('last-3', herb.dim('--------------------------'));
        this.log.line('last-2', herb.cyan('Development Server:'), herb.bgRed(' http://localhost:' + this.port + ' '));
        this.log.line('last-1', herb.cyan('Created on:'), new Date(Date.parse(this.config.createdAt)));
        this.log.line('last', herb.cyan('Development Time:'), (this.config.timeSpent < 60)?this.config.timeSpent + ' minute(s)':Math.round(this.config.timeSpent/60)+' hour(s)');
    }
    eventEmmiter.call(this);
}

util.inherits(blanc, eventEmmiter);

blanc.prototype.init = require('./methods/init');
blanc.prototype.watch = require('./methods/watch');
blanc.prototype.build = require('./methods/build');

// Automatically overwatches default paths
/// This function is separated from WATCH mainly for API purposes
blanc.prototype.autoOverwatch = function(callback) {
    this.overwatch(['./source/*/*', './source/*', './markdown/*/*.md', './markdown/*.md'], 'jadify');
    this.overwatch(['./stylesheets/*.less', './stylesheets/*/*.less'], 'lessify');
    this.overwatch(['./resources/*', './resources/*/*'], 'resourcify');
    this.overwatch(['./javascript/*.js', './javascript/*/*.js'], 'browserify');
    if(callback) callback(null);
}

/*
// Resolves and Watches an Array of paths for changes
// *func* is called on change
*/
blanc.prototype.overwatch = function(source, func) {
    var self = this;

    this[func]();
    watch(self.resolve(source), function(){
        self.idle = 0;
        self[func].apply(self, arguments);
    });
}

/*
// Resolves an Array of paths to the project directory
*/
blanc.prototype.resolve = function(paths) {
    var self = this;
    var paths = _.toArray(paths);
    var resolved = [];
    _.each(paths, function(PATH) {
        if (PATH.substring(0, 1) == '!') {
            resolved.push('!' + path.resolve(self.directory || '', PATH.substring(1)));
        } else {
            resolved.push(path.resolve(self.directory || '', PATH));
        }
    })
    return resolved;
}
// Reloads development server (livereload)
blanc.prototype.reload = connect.reload;
blanc.prototype.event = function(ev) {
    var self = this;
    var args = _.toArray(arguments);
    if(ev.substring(0,1) == '!') {
        args[0] = ev.substring(1);
        return self.emit.apply(self, args);
    }
    return stream.map(function(data, callback) {
        if(ev) process.nextTick(function(){
            self.emit.apply(self, args);
        })
        return callback(null, data);
    })
}

//// MODULES ////
blanc.prototype.jadify = require('./modules/jadify');
blanc.prototype.lessify = require('./modules/lessify');
blanc.prototype.resourcify = require('./modules/resourcify');
blanc.prototype.browserify = require('./modules/browserify');
//// ------ ////

module.exports = function(){
    return new blanc();
};
