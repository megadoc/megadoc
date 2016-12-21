const path = require('path');
const jsdom = require('jsdom');
const K = require('./constants');
const generateHTMLFile = require('./generateHTMLFile');
const FakeWindowContext = require('./FakeWindowContext');
const COMMON_BUNDLE = path.join(K.BUNDLE_DIR, K.COMMON_BUNDLE);
const MAIN_BUNDLE = path.join(K.BUNDLE_DIR, K.MAIN_BUNDLE);
const VENDOR_BUNDLE = path.join(K.BUNDLE_DIR, K.VENDOR_BUNDLE);
const generateRuntimeConfig = require('./generateRuntimeConfig');

// TODO: investigate using node vm module for this?
function ClientSandbox(serializerConfig) {
  this.config = serializerConfig;

  this.state = {
    dom: null,
    fakeWindowContext: null,
    ui: null,
    window: null,
  };
}

ClientSandbox.prototype.start = function(assets, done) {
  const dom = jsdom.jsdom(generateHTMLFile({
    params: {
      scripts: [],
      styleSheets: [ K.STYLE_BUNDLE ],
    },
    sourceFile: this.config.htmlFile,
    assets: assets,
    distanceFromRoot: 0
  }), {
    url: 'http://localhost'
  });

  const window = dom.defaultView;
  const fakeWindowContext = FakeWindowContext(window, global);

  fakeWindowContext.install();

  require(VENDOR_BUNDLE);

  fakeWindowContext.expose('webpackJsonp_megadoc', window.webpackJsonp_megadoc);
  fakeWindowContext.expose('console.debug', Function.prototype);

  if (!console.debug) {
    console.debug = Function.prototype;
  }

  const commonModules = require(COMMON_BUNDLE);

  fakeWindowContext.expose('MEGADOC_PUBLIC_MODULES', commonModules);

  this.state.megadocClient = require(MAIN_BUNDLE);

  // fakeWindowContext.expose('megadoc', window.megadoc);

  this.state.runtimePlugins = assets.pluginScripts.map(function(filePath) {
    const pluginExports = require(filePath);

    return pluginExports[Object.keys(pluginExports)[0]];
  });

  this.state.dom = dom;
  this.state.window = window;
  this.state.fakeWindowContext = fakeWindowContext;

  done();
};

ClientSandbox.prototype.createClient = function(assets, corpus) {
  // TODO DRY alert, see HTMLSerializer__write.js
  const runtimeConfig = Object.assign(generateRuntimeConfig(this.config, assets), {
    plugins: this.state.runtimePlugins,
    database: corpus
  });

  return this.state.megadocClient.createClient(runtimeConfig);
};

ClientSandbox.prototype.stop = function(assets, done) {
  assets.pluginScripts.concat([ MAIN_BUNDLE, VENDOR_BUNDLE, ]).forEach(unloadModule);

  this.state.fakeWindowContext.restore();
  this.state = {};

  done();
};

module.exports = ClientSandbox;

function unloadModule(fileName) {
  delete require.cache[require.resolve(fileName)];
}
