#!/usr/bin/env node

var program = require('commander');
var path = require('path');
var pkg = require('../package');
var { compilePlugin } = require('megadoc-html-serializer');
var ctx = {};

program
  .version(pkg.version)
  .description('Compile a megadoc UI plugin.')
  .arguments('<outfile> <entry_file> [other_entry_files...]')
  .option('--optimize', 'Build a production-ready version.')
  .action(function(output, entry, otherEntries) {
    ctx.output = output;
    ctx.entry = [ entry ].concat(otherEntries);

    compilePlugin(
      ctx.entry.map(resolvePath),
      resolvePath(ctx.output),
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