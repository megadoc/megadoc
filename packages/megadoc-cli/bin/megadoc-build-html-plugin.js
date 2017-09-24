#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const pkg = require('../package');
const { compilePlugin } = require('megadoc-html-serializer/addon');

program
  .version(pkg.version)
  .description('Compile a megadoc UI plugin.')
  .arguments('<outfile> <entry_file> [other_entry_files...]')
  .option('--optimize', 'Build a production-ready version.')
  .action(function(output, entry, otherEntries) {
    compilePlugin(
      [ entry ].concat(otherEntries).map(resolvePath),
      resolvePath(output),
      {
        optimize: program.optimize,
        verbose: true,
      },
      throwOnError
    );
  })
  .parse(process.argv)
;


function resolvePath(arg) {
  return path.resolve(arg);
}

function throwOnError(e) {
  if (e) {
    throw e;
  }
}