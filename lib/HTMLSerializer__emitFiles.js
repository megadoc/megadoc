var async = require('async');
var path = require('path');
var _ = require('lodash');
var K = require('./HTMLSerializer__constants');
var Utils = require('./HTMLSerializer__Utils');
var VENDOR_BUNDLE = path.join(K.BUNDLE_DIR, K.VENDOR_BUNDLE);
var MAIN_BUNDLE = path.join(K.BUNDLE_DIR, K.MAIN_BUNDLE);

module.exports = function(jsdom, config, compiler, footer, done) {
  if (config.verbose) {
    console.log('Emitting HTML files...');
  }

  var dom = jsdom.jsdom(Utils.generateHTMLFile({
    params: {
      scripts: [],
      styleSheets: [ K.STYLE_BUNDLE ],
    },
    sourceFile: config.htmlFile,
    assets: compiler.assets,
    distanceFromRoot: 0
  }), {
    url: 'http://localhost'
  });

  var window = dom.defaultView;
  var fakeWindowContext = FakeWindowContext(window, global);

  window.localStorage = {
    setItem: function() {},
    removeItem: function() {},
    clear: function() {}
  };

  fakeWindowContext.install();
  require(VENDOR_BUNDLE);

  fakeWindowContext.expose('webpackJsonp_megadoc', global.window.webpackJsonp_megadoc);
  fakeWindowContext.expose('console.debug', Function.prototype);

  var corpus = compiler.corpus.toJSON();
  var fileList = config.layoutOptions.singlePageMode ? [
    'ui/index',
    'ui/404'
  ] : Object.keys(corpus);

  // TODO DRY alert, see HTMLSerializer__write.js
  window.CONFIG = _.extend({}, config, {
    version: require('../package').version,
    pluginCount: compiler.assets.pluginScripts.length,
    pluginConfigs: compiler.assets.runtimeConfigs,
    database: corpus,
    footer: footer,

    $static: {
      readyCallback: function(ui) {
        var emitDocumentFile = DocumentFileEmitter({
          config: config,
          ui: ui,
          corpus: corpus,
          compiler: compiler,
        });

        async.eachSeries(fileList, emitDocumentFile, function(error) {
          if (config.verbose) {
            console.log('Cleaning up HTML-file emitting context...');
          }

          fakeWindowContext.restore();

          compiler.assets.pluginScripts.concat([
            MAIN_BUNDLE,
            VENDOR_BUNDLE,
          ]).forEach(unloadModule);

          done(error);

          if (config.verbose) {
            console.log('Done!. All HTML files were emitted.');
          }
        });
      },
    },
  });

  require(MAIN_BUNDLE);

  fakeWindowContext.expose('megadoc', window.megadoc);
  window.megadoc.start();

  compiler.assets.pluginScripts.forEach(function(filePath) {
    require(filePath);
  });
};

function DocumentFileEmitter(params) {
  var compiler = params.compiler;
  var ui = params.ui;
  var corpus = params.corpus;

  return function emitDocumentFile(uid, done) {
    var node = typeof uid === 'string' ? corpus[uid] : uid;
    var href = node.meta && node.meta.href;

    if (node.type === 'DocumentEntity') {
      return done();
    }
    else if (!href) {
      console.log('Document "%s" has no @href - an HTML file will not be emitted.', node.uid);
      return done();
    }

    // we replace the hashtag for single-page mode URLs, otherwise ensure there
    // is no leading slash in the filepath! we do not want to write to /
    var filePath = href.replace(/^(\#?)\/+/, '');

    if (params.config.verbose) {
      console.log('Emitting HTML file "%s" (URL = "%s", UID = "%s")', filePath, href, node.uid);
    }

    ui.render(href, function(err, html) {
      if (err) {
        console.warn("Unable to emit file for '%s': %s", node.uid, err);
        return done();
      }

      var distanceFromRoot = href.split('/').length - 1;
      var docHTML = Utils.generateHTMLFile({
        params: {
          title: node.title,
          metaDescription: node.summary,
          contents: html,
          startingDocumentUID: node.uid,
        },
        sourceFile: params.config.htmlFile,
        assets: params.compiler.assets,
        distanceFromRoot: distanceFromRoot
      });

      var rc = compiler.utils.writeAsset(filePath, docHTML, {
        forceOverwrite: node.meta.hrefRewritten
      });

      if (rc === 'ERR_FILE_EXISTS') {
        console.error('Offending document:', node.uid);
      }

      done();
    });
  }
}

function FakeWindowContext(window, target) {
  var muddied = [];

  function expose(key, value) {
    if (!target.hasOwnProperty(key)) {
      target[key] = value;
      muddied.push(key);
    }
  }

  return {
    install: function() {
      target.window = window;

      for (var key in window) {
        if (window.hasOwnProperty(key)) {
          expose(key, window[key]);
        }
      }
    },

    expose: expose,

    restore: function() {
      muddied.forEach(function(key) {
        delete target[key];
      });

      delete target['window'];
    }
  };
}

function unloadModule(fileName) {
  delete require.cache[require.resolve(fileName)];
}
