var _ = require('lodash');
var os = require("os");
var fs = require('fs-extra');
var path = require('path');

var herb = require('herb');
var async = require('async');

module.exports = function(fullPath, dest, silent, callback) {
    var self = this;

    // Setup progress
    if(silent) self.log.silent(silent);
    var progress = _.bind(self.log.progress, self.log);
    var progressLog = _.bind(self.log.progressLog, self.log);
    self.log.clear(0,0);

    if (!fullPath) throw Error('A PATH IS REQUIRED FOR INIT');
    var template = path.resolve(__dirname, '../template');

    if(dest) {
        this.config.dest = dest;
        dest = path.resolve(fullPath, dest);
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
