#!/usr/bin/env node

const async = require('async');
const http = require('http')
const connect = require('connect');
const serveStatic = require('serve-static');
const proxyAssets = require('./proxyAssets');
const configureWebpack = require('./configureWebpack');
const addWebpack = require('./addWebpack');
const Compiler = require('megadoc-compiler');
const { constants: K, extractRuntimeParameters } = require('megadoc-html-serializer/addon');
const R = require('ramda');

const run = async.seq(
  (options, done) => {
    const runtimeConfig = extractRuntimeParameters({ config: options.actualConfig });

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
    const clientSandbox = {
      start: (x, callback) => callback(),
      stop: (x, callback) => callback()
    }

    const compiler = Compiler.create({})

    Compiler.boot(compiler)(state.compilerConfig, function(err, { serializer, compilations }) {
      if (err) {
        done(err);
      }
      else {
        serializer.state.clientSandbox = clientSandbox
        serializer.start(compilations, function(startError) {
          const { assets } = serializer.state
          const { config: serializerConfig } = serializer

          if (startError) {
            done(startError);
          }
          else {
            serializer.stop(function() {

              done(null, Object.assign({}, state, {
                assets,
                serializerConfig,
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
