const path = require('path');
const K = require('../constants');
const FakeWindowContext = require('./FakeWindowContext');
const generateRuntimeConfig = require('./generateRuntimeConfig');
const COMMON_BUNDLE = path.join(K.BUNDLE_DIR, K.COMMON_BUNDLE);
const MAIN_BUNDLE = path.join(K.BUNDLE_DIR, K.MAIN_BUNDLE);
const VENDOR_BUNDLE = path.join(K.BUNDLE_DIR, K.VENDOR_BUNDLE);

// TODO: investigate using node vm module for this?
function ClientSandbox(serializerConfig) {
  this.config = serializerConfig;

  this.state = {
    fakeWindowContext: null,
    megadocClient: null,
  };
}

ClientSandbox.prototype.start = function(assets, done) {
  this.state.fakeWindowContext = FakeWindowContext(global, global);

  const { fakeWindowContext } = this.state;

  fakeWindowContext.install();

  require(VENDOR_BUNDLE);

  fakeWindowContext.expose('webpackJsonp_megadoc', global.webpackJsonp_megadoc);
  fakeWindowContext.expose('MEGADOC_PUBLIC_MODULES', require(COMMON_BUNDLE));
  fakeWindowContext.expose('exports', assets.pluginScripts.reduce(function(acc, filePath) {
    return Object.assign(acc, require(filePath));
  }, {}))

  this.state.megadocClient = require(MAIN_BUNDLE);

  done();
};

ClientSandbox.prototype.createClient = function(assets, corpus) {
  return this.state.megadocClient.createClient(generateRuntimeConfig({
    assets,
    config: this.config,
    corpus,
  }));
};

ClientSandbox.prototype.stop = function(assets, done) {
  assets.pluginScripts.concat([ MAIN_BUNDLE, VENDOR_BUNDLE, ]).forEach(unloadModule);

  this.state.fakeWindowContext.restore();
  this.state = {};

  done();
};

module.exports = ClientSandbox;

function unloadModule(fileName) {
  try {
    delete require.cache[require.resolve(fileName)];
  }
  catch (e) {
    // This is a temporary band-aid: the problem was with inline plugins being
    // compiled and then removed before the sandbox is stopped, so it looks like
    // the require cache has been busted implicitly during the removal and then
    // the call above borks...
    //
    // the current approach to generating the inline plugin is going to change
    // so this (likely) won't be necessary then
    console.warn('Unable to purge "%s" from cache', fileName);
  }
}
