const async = require('async');
const BlankSerializer = require('./BlankSerializer');
const ConfigUtils = require('megadoc-config-utils');
const createCompilation = require('./createCompilation');
const defaults = require('./config');
const divisus = require('divisus');
const fs = require('fs-extra');
const Linter = require('megadoc-linter');
const os = require('os');
const parseConfig = require('./parseConfig');
const path = require('path');
const R = require('ramda');
const Service = require('./Service');
const { assocWith, asyncify, asyncSequence, mergeWith } = require('./utils');

module.exports = function boot(instrument) {
  return asyncSequence([
    instrument.async('boot:parse-config')
    (
      asyncify(
        assocWith
        (
          'config'
        )
        (
          ({ userConfig }) => mergeWith(defaults, parseConfig(userConfig))
        )
      )
    ),

    instrument.async('boot:create-temp-directory')
    (
      createTempDirectory
    ),

    instrument.async('boot:create-linter')
    (
      createLinter
    ),

    instrument.async('boot:create-compilations')
    (
      asyncify
      (
        assocWith
        (
          'compilations'
        )
        (
          R.partial(createCompilations, [
            {
              optionWhitelist: [
                'assetRoot',
                'debug',
                'outputDir',
                'tmpDir',
                'verbose',
              ]
            }
          ])
        )
      )
    ),

    (state, callback) => async.parallel([
      instrument.async('boot:start-services')
      (
        R.partial(startServices, [state])
      ),

      R.curry(async.waterfall)([
        instrument.async('boot:create-serializer')
        (
          R.partial(createSerializer, [state])
        ),

        instrument.async('boot:start-serializer')
        (
          startSerializer
        ),
      ]),

      instrument.async('boot:start-cluster')
      (
        R.partial(startCluster, [state])
      ),
    ], (err, results) => {
      if (err) {
        callback(err)
      }
      else {
        callback(null, R.mergeAll([ state ].concat(R.unnest(results))))
      }
    })
  ])
}

function createSerializer(state, done) {
  const { config } = state;
  const serializerSpec = ConfigUtils.getConfigurablePair(config.serializer);
  let serializer;

  if (!serializerSpec) {
    serializer = new BlankSerializer()
  }
  else {
    const serializerModule = require(serializerSpec.name);
    const factory = serializerModule.factory || serializerModule;

    serializer = new factory(config, serializerSpec.options);
  }

  done(null, Object.assign({}, state, { serializer }));
}

function createLinter(state, done) {
  const { config } = state;

  done(null, Object.assign({}, state, { linter: Linter.for(config) }));
}

function createCompilations({ optionWhitelist }, state) {
  const compilations = R.map
    (
      R.partial(createCompilation, [ optionWhitelist, state ])
    )
    (
      state.config.sources
    )
  ;

  return compilations;
}

function startSerializer(state, done) {
  const { serializer, compilations } = state;

  // todo: cluster
  serializer.start(compilations, function(err) {
    if (err) {
      done(err);
    }
    else {
      done(null, { serializer });
    }
  });
}

function startCluster(state, done) {
  const createCluster = state.config.threads === 1 ?
    divisus.createForegroundCluster :
    divisus.createCluster
  ;

  const cluster = createCluster({ size: state.config.threads })

  cluster.start(function(err) {
    if (err) {
      done(err);
    }
    else {
      done(null, { cluster });
    }
  });
}

function startServices(state, done) {
  const services = Service.start(Service.DefaultPreset, state);

  services.up(function(err) {
    done(err, { services });
  });
}

function createTempDirectory(state, done) {
  const tmpDir = state.config.tmpDir;

  if (tmpDir) {
    fs.ensureDir(tmpDir, function(err) {
      if (err) {
        done(err);
      }
      else {
        done(null, state);
      }
    });
  }
  else {
    fs.mkdtemp(path.join(os.tmpdir(), `megadoc-`), function(err, folder) {
      if (err) {
        done(err);
      }
      else {
        done(null, Object.assign({}, state, {
          config: Object.assign({}, state.config, {
            tmpDir: folder
          })
        }))
      }
    });
  }
}