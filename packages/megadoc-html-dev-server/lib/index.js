#!/usr/bin/env node

const async = require('async');
const http = require('http')
const connect = require('connect');
const serveStatic = require('serve-static');
const proxyAssets = require('./proxyAssets');
const configureWebpack = require('./configureWebpack');
const addWebpack = require('./addWebpack');
const Compiler = require('megadoc-compiler');
const { ClientSandbox, constants: K, extractRuntimeParameters } = require('megadoc-html-serializer/addon');
const R = require('ramda');

const run = async.seq(
  (options, done) => {
    const runtimeConfig = extractRuntimeParameters({ configFilePath: options.configFilePath });

    done(null, Object.assign({}, options, R.pick([
      'compilerConfig',
      'runtimeConfig',
      'runtimeConfigFilePath',
      'runtimeOutputPath',
      'contentBase',
    ], runtimeConfig)));
  },

  // grab assets / config from a running serializer instance
  (state, done) => {
    const restoreClientSandbox = stubClientSandbox();
    const compiler = Compiler.create({})

    Compiler.boot(compiler)(state.compilerConfig, function(err, compilationState) {
      restoreClientSandbox();

      if (err) {
        done(err);
      }
      else {
        const { serializer } = compilationState

        serializer.start(compilationState.compilations, function(serializerErr) {
          if (serializerErr) {
            done(serializerErr);
          }
          else {
            serializer.stop(function() {
              done(null, Object.assign({}, state, {
                assets: serializer.state.assets,
                serializerConfig: serializer.config,
              }))
            })
          }
        });
      }
    })
  },

  (state, done) => {
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
    done();
  }
)

module.exports = run;

function startServer({
  assets,
  contentBase,
  host,
  port,
  runtimeConfig,
  runtimeConfigFilePath,
  runtimeOutputPath,
  serializerConfig,
  sourceFiles,
  tmpDir,
}, done) {
  const app = connect();

  addWebpack({
    webpackConfig: configureWebpack({
      additionalFiles: sourceFiles,
      assets,
      runtimeConfig,
      runtimeConfigFilePath,
      runtimeOutputPath,
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
      `${K.CONFIG_FILE}`,
      `${K.STYLES_FILE}`,
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