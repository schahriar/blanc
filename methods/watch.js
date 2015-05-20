var _ = require('lodash');
var os = require("os");
var fs = require('fs-extra');
var path = require('path');
var launch = require('open');

var portscanner = require('portscanner');

module.exports = function(directory, silent, open, callback) {
    var self = this;

    var connect = this.connect;

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

    if (!directory) directory = self.directory || process.cwd();

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
        if(open) launch('http://localhost:'+port);
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
