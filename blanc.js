var eventEmmiter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');

//
var gulp = require('gulp');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var portscanner = require('portscanner');
var stream = require('event-stream');
//

var herb = require('herb');
var async = require('async');

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

blanc.prototype.init = function(fullPath, dest, silent, callback) {
    var self = this;
    var silentLog = (!silent)?self.log:{ clear: new Function, line: new Function };

    if (!fullPath) throw Error('A PATH IS REQUIRED FOR INIT');
    var template = path.resolve(__dirname, './template');

    if(dest) {
        this.config.dest = dest;
        dest = path.resolve(fullPath, dest);
    }

    silentLog.clear(0,0);

    var nCount = 1;

    function progress(color, text) {
        return function(callback) {
            if(silent) return (callback)?callback():false;
            silentLog.line('last', herb.blue(' blanc | ') + herb[color](text));
            if(callback) setTimeout(callback, 1000);
        }
    }

    function progressLog() {
        var args = _.toArray(arguments);
        var time = args.shift();
        var callback = args.pop();
        if(silent) return (callback)?callback():false;
        setTimeout(function(){
            console.log(args.join(' '));
            callback();
        }, time * nCount);
        nCount++;
    }

    async.waterfall([
        progress('magenta', 'Initializing directory ...'),
        progress('yellow', 'Creating new .blanc file ...'),
        function(callback){
            if(!silent) herb.log('.blanc set to:').humanify(self.config);
            fs.writeFile(path.resolve(fullPath, '.blanc'), JSON.stringify(self.config, null, 2), callback);
        },
        progress('green', '.blanc file created ...'),
        function(callback){
            progress('yellow', 'Checking directory ...')(function(){
                fs.readdir(fullPath, callback);
            });
        },
        function(files, callback){
            // Add exception for hidden files & Node related files/directories
            async.filter(files, function(n, callback){
                var keep = true;
                if (n.toLowerCase() === 'package.json') keep = !keep;
                if (n.toLowerCase() === 'node_modules') keep = !keep;
                if (n.substring(0, 1) === '.') keep = !keep;
                progressLog(1500/files.length, (keep)?herb.red('NOPE'):herb.green('OK'), (keep)?herb.yellow(n):herb.dim(n), function(){
                    callback(keep);
                });
            }, function(files){
                if (files.length !== 0) {
                    herb.marker({ style: 'dim' }).line('-');
                    callback(
                        herb.red("THIS DIRECTORY MUST BE EMPTY!\n")
                        +
                        herb.cyan("REMOVE ") + herb.yellow(files.join(', '))
                    );
                } else {
                    callback();
                }
            });
        },
        progress('green', 'Directory is OK! Copying files ...'),
        function(callback) {
            fs.copy(template, fullPath, callback);
        }
    ], function (error, result) {
           if(error) {
               if(!silent) console.error(error);
               progress('red', 'INIT FAILED!')();
               if(callback) callback(error);
           }
           else {
               if(!silent) herb.log('RUN', herb.magenta('blanc watch'), 'to start a rapid development server!');
               progress('yellow', 'SUCCESSFULLY INITIALIZED!')();
               if(callback) callback(null, self.config.createdAt);
           }
    });
}

blanc.prototype.watch = function(directory, silent, callback) {
    var self = this;

    if (silent !== undefined) self.log.silent(silent);
    self.log.header('ready!');

    /* This section is all thanks to forced logs by gulp-connect */
    // Replace console log
    if(silent !== 'force') console.log = console.warn = console.error = function() {
        self.log.addLog.apply(self.log, arguments)
    };
    else {
        // This will prevent gulp-connect logs for Mocha
        console.log = function() {
            if (/\[.*?\]/.exec(arguments[0])) return false;
            else console.warn.apply(null, arguments);
        };
    }
    // --------------------------------------------------------- //

    if (!directory) directory = process.cwd();

    // Checks if .blanc file exists
    if(!fs.existsSync(path.resolve(directory, '.blanc'))) {
        self.log.error('.blanc');
        return herb.error('.blanc file does not exists! Run', herb.magenta('blanc fix or blanc init'));
    }

    try {
        self.config = JSON.parse(fs.readFileSync(path.resolve(directory, '.blanc'), 'utf8')) || self.config;
        self.dest = path.resolve(directory, self.config.dest || '');
        self.directory = directory;
    }catch(e) {
        callback('.blanc issue')
        self.log.error('.blanc');
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
        // Callback after port is determined
        if(callback) callback(null, self.port);
    })

    self.setFooter();
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

    self.autoOverwatch();
}

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
    if((ev) && (ev.substring(0,1) === '!')) {
        args[0] = ev.substring(1);
        setTimeout(function(){
            self.emit.apply(self, args);
        }, 500)
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
