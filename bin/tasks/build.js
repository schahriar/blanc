var path = require('path');

module.exports = function(blanc, argv) {
    if(!argv._[1]) argv._[1] = 'build';
    var dir = (argv.absolute)?argv._[1] || process.cwd():path.resolve(process.cwd(), argv._[1] || '');
    blanc.build(dir, argv.archive || argv.zip, argv.silent);
}
