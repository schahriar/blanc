var path = require('path');

module.exports = function(blanc, argv) {
    var dir = (argv.absolute)?argv._[1] || process.cwd():path.resolve(process.cwd(), argv._[1] || '');
    blanc.init(dir, argv._[2]);
}
