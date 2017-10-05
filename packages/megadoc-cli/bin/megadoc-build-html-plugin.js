#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const pkg = require('../package');
const { compilePlugin } = require('megadoc-html-serializer/addon');

program
  .version(pkg.version)
  .description('Compile a megadoc UI plugin.')
  .option('-o, --output [file]')
  .option('-e, --entry [file]')
  .option('--optimize', 'Build a production-ready version.')
  .option('--source-maps')
  .parse(process.argv)
;

compilePlugin([ program.entry ].map(resolvePath), resolvePath(program.output), {
  optimize: program.optimize,
  sourceMaps: program.sourceMaps,
  verbose: true,
}, throwOnError);

function resolvePath(arg) {
  return path.resolve(arg);
}

function throwOnError(e) {
  if (e) {
    throw e;
  }
}