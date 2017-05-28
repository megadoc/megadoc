#!/usr/bin/env node

const path = require('path');
const async = require('async');
const http = require('http')
const os = require('os')
const connect = require('connect');
const serveStatic = require('serve-static');
const proxyAssets = require('./proxyAssets');
const loadRuntimeConfig = require('./loadRuntimeConfig');
const configureWebpack = require('./configureWebpack');
const addWebpack = require('./addWebpack');
const { run: compile, BREAKPOINT_COMPILE } = require('megadoc-compiler');
const { constants: K, ClientSandbox } = require('megadoc-html-serializer');
const R = require('ramda');

const run = async.seq(
  (options, done) => {
    const runtimeConfig = loadRuntimeConfig({
      configFilePath: options.configFilePath
    });

    done(null, Object.assign({}, options, R.pick([
      'compilerConfig',
      'runtimeConfig',
      'runtimeOutputPath',
      'contentBase',
    ], runtimeConfig)));
  },

  (state, done) => {
    let assets;
    let serializerConfig;

    const restoreClientSandbox = stubClientSandbox();

    compile(state.compilerConfig, {
      breakpoint: BREAKPOINT_COMPILE,
      tap: compilationState => {
        assets = compilationState.serializer.state.assets;
        serializerConfig = compilationState.serializer.config;
      }
    }, function(err) {
      restoreClientSandbox();

      if (err) {
        done(err);
      }
      else {
        done(null, Object.assign({}, state, {
          assets,
          serializerConfig
        }))
      }
    })
  },

  (state, done) => {
    console.log('Serving from:', state.contentBase);

    startServer(state, function(err) {
      if (err) {
        done(err);
      }
      else {
        done(null, state);
      }
    });
  },

  (state, done) => {
    console.log('Hot server listening at "http://%s:%s"', state.host, state.port);

    done();
  }
)

run({
  configFilePath: path.resolve(process.env.CONFIG_FILE),
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || '8942',
  sourceFiles: process.argv.slice(3).map(x => path.resolve(x)),
  tmpDir: os.tmpdir(),
}, function(err) {
  if (err) {
    throw err;
  }
})

function startServer({
  assets,
  contentBase,
  host,
  port,
  runtimeConfig,
  runtimeOutputPath,
  serializerConfig,
  sourceFiles,
  tmpDir,
}, done) {
  const app = connect();

  addWebpack({
    webpackConfig: configureWebpack({
      additionalFiles: sourceFiles,
      runtimeConfig,
      runtimeOutputPath,
      assets,
      serializerConfig,
      tmpDir,
    }),
    runtimeOutputPath,
    contentBase,
    additionalFiles: sourceFiles,
  }, app);

  proxyAssets({
    runtimeOutputPath,
    files: [
      `${K.STYLE_BUNDLE}`,
    ]
  }, app)

  app.use(serveStatic(contentBase, { etag: false }));

  http.createServer(app).listen(port, host, done);
}


function stubClientSandbox() {
  const { start, stop } = ClientSandbox.prototype;

  ClientSandbox.prototype.start = function(_, callback) {
    callback();
  }

  ClientSandbox.prototype.stop = function(_, callback) {
    callback();
  }

  return function restoreClientSandbox() {
    ClientSandbox.prototype.stop = stop;
    ClientSandbox.prototype.start = start;
  }
}