#!/usr/bin/env node

const http = require('http')
const connect = require('connect');
const serveStatic = require('serve-static');
const loadRuntimeConfig = require('./loadRuntimeConfig');
const configureWebpack = require('./configureWebpack');
const addWebpack = require('./addWebpack');

const run = (options, done) => {
  const runtimeConfig = loadRuntimeConfig({
    preloadedConfig: options.config,
    configFilePath: options.configFilePath
  });

  const state = Object.assign({}, options, runtimeConfig);

  console.log('[I] Serving docs from:', state.contentBase);

  startServer(state, function(err) {
    if (err) {
      done(err);
    }
    else {
      console.log('[I] Server now active at "http://%s:%s"', state.host, state.port);

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
