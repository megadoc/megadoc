#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package');

program
  .version(pkg.version)
  .description('Generate static documentation.')
  .command('compile', 'generate static documentation', { isDefault: true })
  .command('compile-plugin', 'compile a megadoc JavaScript plugin')
  .command('edit', 'start a web server and edit in real-time')
  .parse(process.argv)
;
