var path = require('path');

module.exports = function(blanc, argv) {
    blanc.watch(argv._[1], argv.silent);
}
