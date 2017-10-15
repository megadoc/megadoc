#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const addCommonOptions = require('../lib/addCommonOptions');
const parseCommonOptions = require('../lib/parseCommonOptions');
const { run: compileAndWatch } = require('../lib/compileAndWatch');
const { fork } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const os = require('os');

addCommonOptions(program)
  .description('Serve documentation through a web-server and reflect changes in real-time.')
  .option('-h, --host [address]', 'ethernet address to listen on', '0.0.0.0')
  .option('-p, --port [port]', 'port to bind to', '8942')
  .option('--dev')
  .parse(process.argv)
;

try {
  if (program.dev) {
    require.resolve('megadoc-html-dev-server');
  }
  else {
    require.resolve('megadoc-html-live-server');
  }
}
catch (e) {
  console.error('%s: the package "megadoc-html-live-server" must be installed', program._name);
  process.exit(1);
}

const { config, configFilePath } = parseCommonOptions(program);
const startedAt = new Date();

console.log('[I] Generating documentation for the first time... please hold on.');

compileAndWatch(config, {
  purge: true,
  breakpoint: null,
  profile: program.profile,
}, function(compilationError) {
  if (compilationError) {
    throw compilationError;
  }

  console.log('[I] OK, just need to start the web server now!');

  const fd = program.dev ?
    fork(path.resolve(__dirname, '../lib/launchHtmlDevServer.js')) :
    fork(path.resolve(__dirname, '../lib/launchHtmlLiveServer.js'))
  ;

  const { host, port } = program;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `megadoc-cli-`));

  fd.on('message', function(message) {
    if (message.name === 'ALIVE') {
      process.on('exit', function() {
        console.log('Shutting down the server');
        fd.kill();
        fd.disconnect();
      });

      fd.send({
        configFilePath,
        host,
        port,
        sourceFiles: [],
        tmpDir,
      })
    }
    else if (message.name === 'READY') {

      const elapsed = (new Date() - startedAt) / 1000;
      console.log(`[I] Oomph, all set! Took about ${elapsed} seconds.`)
      console.log(`[I] Open "${chalk.bold(`http://${host}:${port}"`)} with a browser to continue.`);
    }
  })
});
