#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package');
const { run: compile } = require('megadoc-compiler');
const { run: compileAndWatch } = require('../lib/compileAndWatch');
const printProfile = require('../lib/printProfile');
const addCommonOptions = require('../lib/addCommonOptions');
const parseCommonOptions = require('../lib/parseCommonOptions');

addCommonOptions(program)
  .description('Generate static documentation.')
  .option('--breakpoint [BREAKPOINT]', 'Debugging breakpoint')
  .option('--dump-config')
  .option('--dump-corpus <PATH>')
  .option('-w, --watch', 'Run in watch mode.')
  .option('--no-purge', 'Do not purge the output directory.')
  .option('--stats', 'Show scanner-related statistics.')
  .parse(process.argv)
;

const { config } = parseCommonOptions(program);

if (program.dumpConfig) {
  console.log('Config:\n', config);
}

console.log('megadoc: version "%s".', pkg.version);

const runOptions = {
  purge: program.purge,
  profile: program.profile,
  breakpoint: asNumberOrNull(program.breakpoint),
};

if (program.watch) {
  compileAndWatch(config, runOptions);
}
else {
  const startedAt = new Date()

  compile(config, runOptions, function(err, result) {
    if (err) {
      console.error(Array(80 - 'megadoc-cli'.length).join('*'));
      console.error('An error occurred during compilation. Error details below.');
      console.error(err.stack ? err.stack : err);
      console.error(Array(80 - 'megadoc-cli'.length).join('*'));

      throw err;
    }

    if (runOptions.profile) {
      printProfile(result.profile)
    }

    const elapsed = (new Date() - startedAt) / 1000
    console.log(`Done: ${elapsed}s.`);
  });
}

function asNumberOrNull(x) {
  const asNumber = parseInt(x, 10);

  if (isNaN(asNumber)) {
    return null;
  }
  else {
    return asNumber
  }
}