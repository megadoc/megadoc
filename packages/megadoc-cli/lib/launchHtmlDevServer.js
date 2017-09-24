const startDevServer = require('megadoc-html-dev-server');

process.on('message', function(options) {
  startDevServer(options, function(err) {
    if (err) {
      console.error('Unable to start the web server!');
      throw err;
    }

    process.send({ name: 'READY' });
  })
})

process.send({ name: 'ALIVE' });