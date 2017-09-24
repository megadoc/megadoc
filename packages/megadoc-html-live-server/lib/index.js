#!/usr/bin/env node

const http = require('http')
const connect = require('connect');
const serveStatic = require('serve-static');
const configureWebpack = require('./configureWebpack');
const addWebpack = require('./addWebpack');
const { extractRuntimeParameters } = require('megadoc-html-serializer/addon');

const run = (options, done) => {
  const runtimeConfig = extractRuntimeParameters({ configFilePath: options.configFilePath });
  const state = Object.assign({}, options, runtimeConfig);

  startServer(state, function(err) {
    if (err) {
      done(err);
    }
    else {
      done(null, state);
    }
  });
};

function startServer({
  contentBase,
  host,
  port,
  runtimeConfig,
  runtimeConfigFilePath,
  runtimeStylesFilePath,
  runtimeOutputPath,
  tmpDir,
}, done) {
  const app = connect();

  addWebpack({
    webpackConfig: configureWebpack({
      runtimeConfig,
      runtimeConfigFilePath,
      runtimeStylesFilePath,
      runtimeOutputPath,
      tmpDir,
    }),
    runtimeOutputPath,
    contentBase,
  }, app);

  app.use(serveStatic(contentBase, { etag: false }));

  http.createServer(app).listen(port, host, done);
}

module.exports = run;
