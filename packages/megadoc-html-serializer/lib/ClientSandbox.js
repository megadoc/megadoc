const path = require('path');
const jsdom = require('jsdom');
const K = require('./constants');
const generateHTMLFile = require('./generateHTMLFile');
const FakeWindowContext = require('./FakeWindowContext');
const VENDOR_BUNDLE = path.join(K.BUNDLE_DIR, K.VENDOR_BUNDLE);
const MAIN_BUNDLE = path.join(K.BUNDLE_DIR, K.MAIN_BUNDLE);
const generateRuntimeConfig = require('./generateRuntimeConfig');

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

  // TODO DRY alert, see HTMLSerializer__write.js
  window.CONFIG = Object.assign(generateRuntimeConfig(this.config, assets), {
    $static: {
      readyCallback: (ui) => {
        this.state.ui = ui;

        done();
      },
    },
  });

  require(MAIN_BUNDLE);

  fakeWindowContext.expose('megadoc', window.megadoc);

  window.megadoc.start();

  assets.pluginScripts.forEach(require);

  this.state.dom = dom;
  this.state.window = window;
  this.state.fakeWindowContext = fakeWindowContext;
};

ClientSandbox.prototype.exposeCorpus = function(flatCorpus) {
  // TODO DRY alert, see HTMLSerializer__write.js
  Object.assign(this.state.window.CONFIG, {
    database: flatCorpus,
  });

  this.state.window.megadoc.regenerateCorpus(flatCorpus);
};

ClientSandbox.prototype.getDelegate = function() {
  return this.state.ui;
}

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
