const pkg = require('../package');

function collect(val, memo) {
  memo.push(val);
  return memo;
}

module.exports = function addCommonOptions(program) {
  program
    .version(pkg.version)
    .option('-c, --config [PATH]', 'path to megadoc config file', 'megadoc.conf.js')
    .option('-o, --output-dir [PATH]', 'directory to store generated documentation in')
    .option('--asset-root [PATH]', 'absolute path to the root directory from which all files should be located')
    .option('--tmp-dir [PATH]', 'directory to use for temporary files')
    .option('-v, --verbose', 'print diagnostic information')
    .option('--debug', 'print painful diagnostic information')
    .option('-j, --threads [COUNT]', 'number of threads to use for processing (1 means foreground)')
    .option('-k, --concurrency [COUNT]', '', 5)
    .option('-t, --only [TAG]', 'compile only the sources tagged with the specified tag(s) or id', collect, [])
    .option('-e, --exclude [TAG]', 'do not compile sources tagged with the specified tag(s) or id', collect, [])
    .option('--profile')
  ;

  return program;
}