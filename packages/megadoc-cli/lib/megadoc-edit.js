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
  .option('-c, --config [PATH]', 'path to megadoc config file', 'megadoc.conf.js')
  .option('-h, --host [address]', 'ethernet address to listen on', '0.0.0.0')
  .option('-p, --port [port]', 'port to bind to', '8942')
  .option('--tmp-dir [directory]', 'directory to store temporary files in', os.tmpdir())
  .option('-v, --verbose', 'Shortcut for --log-level="info"')
  .option('-j, --threads [COUNT]', 'Number of threads to use for processing (1 indicates foreground.)')
  .parse(process.argv)
;

try {
  require.resolve('megadoc-html-live-server');
}
catch (e) {
  console.error('%s: the package "megadoc-html-live-server" must be installed', program._name);
  process.exit(1);
}

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
        host: program.host,
        port: program.port,
        sourceFiles: [],
        tmpDir: program.tmpDir,
      })
    }
    else if (message.name === 'READY') {
      console.log('OK, all set!')
    }
  })
});
