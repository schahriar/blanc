var fs = require('fs-extra');
var path = require('path');
var herb = require('herb');

var defaultBlancFile = {
    dest: './'
}

function writeDefault(dir) {
    fs.writeFile(path.resolve(dir, '.blanc'), JSON.stringify(defaultBlancFile, null, 2), function(error){
        if(error) throw error;
        herb.log(herb.green('Successful!'))
        herb.log(herb.green('You may want to edit'), herb.bold('.blanc'), herb.green('file in the given directory in order to reset the dest attribute.'));
    })
}

module.exports = function(blanc, argv) {
    var dir = (argv.absolute)?argv._[1] || process.cwd():path.resolve(process.cwd(), argv._[1] || '');
    fs.exists(path.resolve(dir, '.blanc'), function(exists) {
        if(exists) {
            fs.readFile(path.resolve(dir, '.blanc'), 'utf8', function(error, data){
                if(error) throw error;
                try {
                    var config = JSON.parse(data);
                    if(!config.dest) {
                        herb.warn("Destination attribute does not exist");
                        herb.log("Attempting file recreation");
                        writeDefault(dir)
                    }else{
                        herb.log(herb.green("No issues found!"));
                    }
                }catch(e) {
                    herb.error("JSON error");
                    herb.log("Attempting to fix the issue");
                    writeDefault(dir);
                }
            })
        }else{
            herb.warn(herb.bold('.blanc'),'file does not exist!');
            herb.log('Creating one now!');
            writeDefault(dir);
        }
    })
}
