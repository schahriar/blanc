var chai = require("chai");
var inspect = require("util").inspect;

var blanc = require('./blanc')();

var _ = require("lodash");
var os = require("os");
var path = require('path');
var fs = require('fs-extra');
var request = require('request');

// override to add delay (makes time for render)
var old_get = request.get;
request.get = function() {
    var self = this, args = _.toArray(arguments);
    setTimeout(function(){
        old_get.apply(self, args)
    }, 500)
}

var should = chai.should();
var expect = chai.expect;

var config = {
    path: path.resolve(os.tmpdir(), 'blanc_MOCHA'),
    file: path.resolve(os.tmpdir(), 'blanc_MOCHA', '.blanc'),
    index: path.resolve(os.tmpdir(), 'blanc_MOCHA', 'source', 'index.jade'),
    locals: path.resolve(os.tmpdir(), 'blanc_MOCHA', 'source', '_locals.json'),
    style: path.resolve(os.tmpdir(), 'blanc_MOCHA', 'stylesheets', 'style.less'),
    md: path.resolve(os.tmpdir(), 'blanc_MOCHA', 'markdown', 'title.md'),
    res: path.resolve(os.tmpdir(), 'blanc_MOCHA', 'resources', 'circle.png'),
    js: path.resolve(os.tmpdir(), 'blanc_MOCHA', 'javascript', 'master.js'),
    require: path.resolve(os.tmpdir(), 'blanc_MOCHA', 'javascript', 'var.js'),
    time: new Date(),
    port: 8080,
    dest: 'test',
    structure: ['javascript', 'markdown', 'resources', 'source', 'stylesheets', '.blanc']
}

// http://stackoverflow.com/questions/6926016/nodejs-saving-a-base64-encoded-image-to-disk
var image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAAB3RJTUUH1QEHDxEhOnxCRgAAAAlwSFlzAAAK8AAACvABQqw0mAAAAXBJREFUeNrtV0FywzAIxJ3+K/pZyctKXqamji0htEik9qEHc3JkWC2LRPCS6Zh9HIy/AP4FwKf75iHEr6eU6Mt1WzIOFjFL7IFkYBx3zWBVkkeXAUCXwl1tvz2qdBLfJrzK7ixNUmVdTIAB8PMtxHgAsFNNkoExRKA+HocriOQAiC+1kShhACwSRGAEwPP96zYIoE8Pmph9qEWWKcCWRAfA/mkfJ0F6dSoA8KW3CRhn3ZHcW2is9VOsAgoqHblncAsyaCgcbqpUZQnWoGTcp/AnuwCoOUjhIvCvN59UBeoPZ/AYyLm3cWVAjxhpqREVaP0974iVwH51d4AVNaSC8TRNNYDQEFdlzDW9ob10YlvGQm0mQ+elSpcCCBtDgQD7cDFojdx7NIeHJkqi96cOGNkfZOroZsHtlPYoR7TOp3Vmfa5+49uoSSRyjfvc0A1kLx4KC6sNSeDieD1AWhrJLe0y+uy7b9GjP83l+m68AJ72AwSRPN5g7uwUAAAAAElFTkSuQmCC';

// Create test directory and empty it
if (!fs.existsSync(config.path)) fs.mkdirSync(config.path);
else fs.emptyDirSync(config.path);

describe('Test Suite', function() {
    describe('Init Tests', function() {
        it('should successfully init a given path', function(done) {
            blanc.init(config.path, config.dest, true, function(error, time) {
                config.time = time;
                done(error);
            });
        })
        it('should successfully replicate folder structure', function() {
            var files = fs.readdirSync(config.path);
            expect(files).to.have.members(config.structure);
        })
        it('should create a correct .blanc file', function() {
            // Reads .blanc file
            var blancFile = JSON.parse(fs.readFileSync(config.file, 'utf8'));
            // Parses date into a JS Date
            blancFile.createdAt = new Date(Date.parse(blancFile.createdAt));
            // Verify
            blancFile.should.deep.equal({
                dest: config.dest,
                createdAt: config.time,
                timeSpent: 0
            })
        })
    })
    describe('Watch Tests', function() {
        it('should successfully begin watching for changes', function(done) {
            blanc.watch(config.path, 'force', function(error, port) {
                config.port = port;
                done(error);
            });
        })
        it('should create a server on a port between 8080 and 9000', function(done) {
            this.timeout(5000);
            request.get('http://localhost:'+config.port, function(err, res, body) {
                expect(res.statusCode).to.equal(200);
                done();
            });
        })
    })
    describe('Jade Tests', function() {
        this.timeout(5000);
        it('should render Jade files correctly', function(done) {
            // Append Jade Test
            fs.appendFileSync(config.index, '        h3 #MOCHA-TEST');
            blanc.on('jade:done', _.once(function() {
                request.get('http://localhost:'+config.port, function(err, res, body) {
                    expect(body).to.contain("#MOCHA-TEST");
                    done();
                });
            }))
        })
        it('should render locals', function(done) {
            // Append Jade Test
            fs.writeFileSync(config.locals, JSON.stringify({
                "title": "Hello Mocha!"
            }, null, 2));
            blanc.on('jade:done', _.once(function() {
                request.get('http://localhost:'+config.port, function(err, res, body) {
                    expect(body).to.contain("Hello Mocha!");
                    done();
                });
            }))
        })
        it('should render markdown correctly', function(done) {
            // Append Jade Test
            fs.appendFileSync(config.md, '\n**Mocha**&*Chai*');
            blanc.on('jade:done', _.once(function() {
                request.get('http://localhost:'+config.port, function(err, res, body) {
                    expect(body).to.contain("<strong>Mocha</strong>&amp;<em>Chai</em>");
                    done();
                });
            }))
        })
    })
    describe('Less Tests', function() {
        this.timeout(5000);
        it('should render less files correctly', function(done) {
            // Append Jade Test
            fs.appendFileSync(config.style, '\n.mocha{color:C0FFEE;transition: mocha 0.3s ease}');
            blanc.on('less:done', _.once(function() {
                request.get('http://localhost:'+config.port+'/css/style.css', function(err, res, body) {
                    expect(body).to.contain(".mocha");
                    expect(body).to.contain("C0FFEE");
                    done();
                });
            }))
        })
        it('should auto-prefix for modern browsers', function(done) {
            // We have already written the test up there ↑
            request.get('http://localhost:'+config.port+'/css/style.css', function(err, res, body) {
                expect(body).to.contain("-webkit-transition: mocha 0.3s ease");
                done();
            });
        })
    })
    describe('Resource Tests', function() {
        this.timeout(12000);
        it('should store images correctly', function(done) {
            var base64Data = image.replace(/^data:image\/png;base64,/, "");
            base64Data += base64Data.replace('+', ' ');
            var binaryData = new Buffer(base64Data, 'base64').toString('binary');
            fs.writeFileSync(config.res, binaryData, 'binary');
            blanc.on('resource:done', _.once(function() {
                request.get('http://localhost:'+config.port+'/resources/circle.png', function(err, res, image) {
                    // Attempting to detect image from size
                    image.length.should.be.equal(908);
                    done();
                });
            }))
        })
    })
    describe('Browserify Tests', function() {
        this.timeout(12000);
        it('should render js files', function(done) {
            fs.writeFileSync(config.js, 'var global = "#mocha"; console.log(global);', 'utf8');
            blanc.on('browserify:done', _.once(function() {
                request.get('http://localhost:'+config.port+'/js/bundle.js', function(err, res, body) {
                    expect(body).to.contain("#mocha");
                    done();
                });
            }))
        })
        it('should require files correctly', function(done) {
            fs.writeFileSync(config.require, 'module.exports = "#REQUIRE-MOCHA"', 'utf8');
            fs.writeFileSync(config.js, 'var global = require("./var.js"); console.log(global);', 'utf8');
            blanc.on('browserify:done', _.once(function(time) {
                request.get('http://localhost:'+config.port+'/js/bundle.js', function(err, res, body) {
                    expect(body).to.contain("#REQUIRE-MOCHA");
                    done();
                });
            }))
        })
        it('should generate sourcemaps', function(done) {
            request.get('http://localhost:'+config.port+'/js/bundle.js.map', function(err, res, body) {
                expect(res.statusCode).to.equal(200);
                done();
            });
        })
    })
})
