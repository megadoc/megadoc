#!/usr/bin/env node

const path = require('path');
const os = require('os');
const program = require('commander');
const pkg = require('../package');
const parseCommonOptions = require('./parseCommonOptions');
const { run: compileAndWatch } = require('./compileAndWatch');
const { fork } = require('child_process');

program
  .version(pkg.version)
  .description('Serve documentation through a web-server and reflect changes in real-time.')
  .option('--config [PATH]', 'path to megadoc config file (defaults to megadoc.conf.js)')
  .option('-v, --verbose', 'Shortcut for --log-level="info"')
  .option('-j, --threads [COUNT]', 'Number of threads to use for processing (1 indicates foreground.)')
  .parse(process.argv)
;

const config = parseCommonOptions(program);

compileAndWatch(config, {
  purge: true,
  breakpoint: null,
  profile: false,
}, function(compilationError) {
  if (compilationError) {
    console.error('Compilation failed!');
    throw compilationError;
  }

  const fd = fork(path.resolve(__dirname, './launchHtmlLiveServer.js'));

  fd.on('message', function(message) {
    if (message.name === 'ALIVE') {
      fd.send({
        config,
        host: process.env.HOST || '0.0.0.0',
        port: process.env.PORT || '8942',
        sourceFiles: [],
        // tmpDir: config.tmpDir,
        tmpDir: os.tmpdir(),
      })
    }
    else if (message.name === 'READY') {
      console.log('OK, all set!')
    }
  })

  // process.nextTick(() => {
  //   startDevServer({
  //     config,
  //     host: process.env.HOST || '0.0.0.0',
  //     port: process.env.PORT || '8942',
  //     sourceFiles: [],
  //     tmpDir: config.tmpDir,
  //   }, function(err) {
  //     if (err) {
  //       console.error('Unable to start the web server!');
  //       throw err;
  //     }

  //   })
  // })
});
