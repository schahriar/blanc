var eventEmmiter = require('events').EventEmitter;
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;

var _ = require('lodash')

var herb = require('herb');
var culinary = require('culinary');
var screen = culinary.size();

var fs = require('fs');
var path = require('path');
var notifier = require('node-notifier');

// Locals
var notifierManager = {};
var logArray = [];
//

function time(noPadding) {
    var now = new Date();
    return (((!noPadding)?" [":"[") + now.getHours() + ":" + ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : now.getMinutes()) + ":" + ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) : now.getSeconds()) + ((!noPadding)?"] ":"]"));
}

var SuperLog = function(title, prefix, silent) {
    this.title = title;
    this.padding = { top: 3, bottom: 0 };
    this.name = (prefix) ? prefix + ' ' + title : title;
    this.hush = !!silent;
    this.nCount = 0;
    this.templates = {
        header: herb.template('write', 'blue', 'white', 'dim', 'magenta', 'white', 'bold'),
        error: herb.template('write', 'yellow', 'dim', 'bgRed', 'red', 'bold')
    }
    this.hasError = false;
    this.solve = function() {
        for (i = 4; i <= screen.height; i++) {
            culinary.position(0, i).eraseLine()
        }
        culinary.position(0, 4);
        this.hasError = false;
    }

    eventEmmiter.call(this);
}

util.inherits(SuperLog, eventEmmiter);

SuperLog.prototype.header = function() {
    if (this.hush === 'force') return false;

    var text = _.toArray(arguments).join(' ');
    culinary.position(0, 0).clearScreen();
    herb.marker({
        style: 'dim'
    }).line('~');
    this.templates.header(this.name, '|', '[start]', text || ' ');
    herb.marker({
        style: 'dim'
    }).line('~');
    culinary.position(0, 4);

    process.on('exit', function(){
        culinary.clearScreen().position(0,0);
    });
}

SuperLog.prototype.task = function(plugin, task, status) {
    if (this.hush === 'force') return false;

    if (this.hasError) this.solve();

    var type = {
        'Less': 'yellow',
        'Jade': 'magenta',
        'Reso': 'cyan',
        'Brow': 'blue'
    }

    culinary.save().position(0, 2).eraseLine();
    try {
        this.templates.header(this.name, '|', time(), herb[type[plugin.substring(0, 4)]](plugin), task, status);
    } catch (e) {
        culinary.write(this.name, '|', time(), plugin, task);
    }
    culinary.restore();

    this.addLog(herb.dim(time(true)), herb[type[plugin.substring(0, 4)]](plugin), task, status || '', 'done!');
    this.notify('Task ' + plugin + ' ' + task + ' done!', plugin);
}

SuperLog.prototype.error = function(plugin, code) {
    if (this.hush === 'force') return false;

    if (this.hasError) this.solve();

    culinary.save().position(0, 2).eraseLine();
    this.templates.error(this.name, '|', time(), 'ERROR: ' + plugin, code);
    culinary.restore();
    this.notify('ERROR: ' + plugin + ' ' + code, 'ERROR')
}

SuperLog.prototype.plumb = function(message) {
    if (this.hush === 'force') return false;

    this.hasError = true;
    culinary.position(0, 4);
    herb.marker({
        color: 'dim'
    }).line('ERROR - ');
    _.each(message.split('\n'), function(line, index) {
        culinary.position(1, index + 5).eraseLine();
        culinary.write(herb.yellow(line || ' ') + '\n');
    })
    culinary.position(0, 4);
}

SuperLog.prototype.addLog = function() {
    if (this.hush === 'force') return false;

    var startAt = 4;
    var available = screen.height - (this.padding.bottom+startAt);
    var type = {
        'Less': 'yellow',
        'Jade': 'magenta',
        'Reso': 'cyan',
        'Brow': 'blue'
    }

    if(logArray.length >= available) logArray.shift();
    logArray.push(_.toArray(arguments).join(' '));

    _.each(logArray, function(log, pos) {
        culinary.position(0, pos + startAt).eraseLine();
        // Process log
        log = log.replace(require('ansi-regex')(), '');
        // If time is prepended
        if (/\[.*?\]/.exec(log)) {
            _time = /\[.*?\]/.exec(log)[0];
        }else{
            _time = time(true) + ' ';
            // Keeps a constant time
            logArray[pos] = _time + log;
        }
        log = log.replace(/\[.*?\]/, '');
        log = (type[log.substring(1,5)])?herb[type[log.substring(1,5)]](log):herb.bold(log);
        log = herb.dim(_time) + log;
        herb.write(log);
    })
}

SuperLog.prototype.notify = function(message, type) {
    if (this.hush) return false;
    if (notifierManager[type] === true) return false;
    notifier.notify({
        title: (type === 'ERROR') ? this.title + ' ERROR' : this.title,
        message: message,
        icon: path.resolve(__dirname, this.title, '.png'),
    })
    notifierManager[type] = true;
    setTimeout(function() {
        notifierManager[type] = false;
    }, (type === 'ERROR') ? 6000 : 3500);
}

SuperLog.prototype.silent = function(type) {
    this.hush = type || true;
}

SuperLog.prototype.clear = function(x, y) {
    if (this.hush === 'force') return false;

    culinary.clearScreen().position(x || 0, y || 0);
}

SuperLog.prototype.line = function() {
    if (this.hush === 'force') return false;

    var args = _.toArray(arguments);
    var line = args.shift();
    if (line.substring(0, 4) === 'last') {
        if(this.padding.bottom < 1) this.padding.bottom = 1;
        if (line.substring(4, 5) === '-') {
            this.padding.bottom = parseInt(line.split('-')[1]) + 1;
            line = screen.height - parseInt(line.split('-')[1]);
        } else line = screen.height + 1;
    }else if (line.substring(0, 5) === 'first') {
        if(this.padding.top < 1) this.padding.top = 1;
        if (line.substring(5, 6) === '+') {
            this.padding.top = parseInt(line.split('-')[1]) + 1;
            line = parseInt(line.split('-')[1]);
        } else line = 1;
    }
    culinary.save().position(0, line).eraseLine();
    culinary.write(args.join(' '));
    culinary.restore();
}

SuperLog.prototype.progress = function(color, text) {
    var self = this;
    return function(callback) {
        if(self.hush) return (callback)?callback():false;

        self.line('last', herb.blue(' '+ self.title +' | ') + herb[color](text));
        if(callback) setTimeout(callback, 1000);
    }
}

SuperLog.prototype.progressLog = function() {
    var self = this;
    var args = _.toArray(arguments);
    var time = args.shift();
    var callback = args.pop();
    if(self.hush) return (callback)?callback():false;
    setTimeout(function(){
        console.log(args.join(' '));
        callback();
    }, time * self.nCount);
    self.nCount++;
}

module.exports = function(title, prefix, silent) {
    return new SuperLog(title, prefix, silent);
};
