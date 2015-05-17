var eventEmmiter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash')

var herb = require('herb');
var culinary = require('culinary');
var screen = culinary.size();

function time() {
    var now = new Date();
    return (" [" + now.getHours() + ":" + ((now.getMinutes() < 10)?("0" + now.getMinutes()):now.getMinutes()) + ":" + ((now.getSeconds() < 10)?("0" + now.getSeconds()): now.getSeconds()) + "] ");
}

var SuperLog = function(name) {
    this.name = name;
    this.templates = {
        header: herb.template('log', 'blue', 'white', 'dim', 'magenta', 'bold'),
        error: herb.template('error', 'yellow', 'dim', 'bgRed', 'red', 'bold')
    }
    this.hasError = false;
    this.solve = function() {
        for(i=4; i<=screen.height; i++){
            culinary.position(0, i).eraseLine()
        }
        culinary.position(0, 4);
        this.hasError = false;
    }
    eventEmmiter.call(this);
}

util.inherits(SuperLog, eventEmmiter);

SuperLog.prototype.header = function() {
    var text = _.toArray(arguments).join(' ');
    culinary.position(0, 0).clearScreen();
    herb.marker({ style: 'dim' }).line('~');
    this.templates.header(this.name, '|', '[start]', text || ' ');
    herb.marker({ style: 'dim' }).line('~');
    culinary.position(0, 4);
}

SuperLog.prototype.task = function(task, status) {
    if(this.hasError) this.solve();

    var type = {
        'Less': 'yellow',
        'Jade': 'magenta',
        'Reso': 'cyan'
    }

    culinary.save().position(0, 2).eraseLine();
    this.templates.header(this.name, '|', time(), herb[type[task.substring(0,4)]](task), status);
    culinary.restore();
}

SuperLog.prototype.error = function(plugin, code) {
    if(this.hasError) this.solve();

    culinary.save().position(0, 2).eraseLine();
    this.templates.error(this.name, '|', time(), 'ERROR: ' + plugin, code);
    culinary.restore();
}

SuperLog.prototype.plumb = function(message) {
    this.hasError = true;
    culinary.position(0,4);
    herb.marker({ color: 'dim' }).line('ERROR - ');
    _.each(message.split('\n'), function(line, index) {
        culinary.position(1, index + 5).eraseLine();
        herb.warn(line || ' ');
    })
    culinary.position(0,4);
}

module.exports = function(name) {
    return new SuperLog(name);
};
