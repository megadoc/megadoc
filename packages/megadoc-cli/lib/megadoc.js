#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package');

program
  .version(pkg.version)
  .description('Generate static documentation.')
  .command('build', 'generate static documentation', { isDefault: true })
  .command('build-html-plugin', 'build the assets of a megadoc JavaScript plugin')
  .command('edit', 'start a web server and edit in real-time')
  .parse(process.argv)
;
