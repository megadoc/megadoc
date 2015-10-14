#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package');

program
  .version(pkg.version)
  .command('compile [entry files] [output]', 'compile a plugin')
  .command('run', 'generate the docs', { isDefault: true })
  .parse(process.argv)
;
