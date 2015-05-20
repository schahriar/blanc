var _ = require('lodash');
var os = require("os");
var fs = require('fs-extra');
var path = require('path');
var async = require('async');
var herb = require('herb');

var archiver = require('archiver');

module.exports = function(directory, shouldArchive, silent, callback) {
    var self = this;

    // Setup progress
    if(silent) self.log.silent(silent);
    var progress = _.bind(self.log.progress, self.log);
    self.log.clear(0,0);

    if (!directory) directory = process.cwd();

    try {
        self.config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.blanc'), 'utf8')) || self.config;
        self.dest = path.resolve(directory, self.config.dest || '');
        self.directory = process.cwd();
    }catch(e) {
        if(callback) callback('.blanc issue');
        return herb.error('.blanc file seems to be corrupted! Run', herb.magenta('blanc fix'));
    }

    self.dest = path.resolve(os.tmpdir(), 'blanc_build');
    if(!fs.existsSync(self.dest)) fs.mkdirSync(self.dest);
    else fs.emptyDirSync(self.dest);

    async.waterfall([
        progress('yellow', 'Jade render started ...'),
        function(callback){
            self.jadify();
            self.on('jade:done', _.once(callback));
        },
        progress('green', 'Jade render done.'),
        progress('yellow', 'Less render started ...'),
        function(callback){
            self.lessify();
            self.on('less:done', _.once(callback));
        },
        progress('green', 'Less render done.'),
        progress('yellow', 'Browserify render started ...'),
        function(callback){
            self.browserify();
            self.on('browserify:done', _.once(callback));
        },
        progress('green', 'Browserify render done.'),
        progress('yellow', 'Resourcify render started ...'),
        function(callback){
            self.resourcify();
            self.on('resource:done', _.once(callback));
        },
        progress('green', 'Resourcify render done.'),
        progress('yellow', 'Preparing build '+((shouldArchive)?'archive':'directory')+' ...'),
    ], function(error, results){
        if(error) throw error;
        // Just as a precaution
        setTimeout(function(){
            if(shouldArchive) {
                var output = fs.createWriteStream(directory);
                var archive = archiver('zip');
                output.on('close', function() {
                    progress('green', 'Done.')();
                    herb.log(herb.green("SUCCESSFULLY ARCHIVED TO"), directory);
                    herb.log(herb.cyan(archive.pointer() + ' total bytes'));
                    process.exit(0);
                });

                archive.on('error', function(err) {
                  throw err;
                });

                archive.directory(self.dest, false, { date: new Date() });

                archive.pipe(output);
                archive.finalize();
            }else{
                fs.copy(self.dest, directory, function(error) {
                    if(error) throw error;
                    progress('green', 'Done.')();
                    herb.log(herb.green("SUCCESSFULLY BUILT TO"), directory);
                    process.exit(0);
                })
            }
        }, 2000)
    })
}
