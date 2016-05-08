var async = require('async');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var template = require('lodash').template;
var K = require('./HTMLSerializer__constants');
var VENDOR_BUNDLE = path.join(K.BUNDLE_DIR, K.VENDOR_BUNDLE);
var MAIN_BUNDLE = path.join(K.BUNDLE_DIR, K.MAIN_BUNDLE);

module.exports = function(jsdom, config, compiler, done) {
  console.log('Emitting HTML files...');

  var indexHtmlFile = template(fs.readFileSync(config.htmlFile, 'utf-8'));
  var dom = jsdom.jsdom(indexHtmlFile({
    scripts: [],
    styleSheets: [ K.STYLE_BUNDLE ],
    title: null,
    metaDescription: null,
    contents: null,
  }));
  var window = dom.defaultView;
  var fakeWindowContext = FakeWindowContext(window, global);

  window.localStorage = {
    setItem: function() {},
    removeItem: function() {},
    clear: function() {}
  };

  fakeWindowContext.install();
  require(VENDOR_BUNDLE);

  fakeWindowContext.expose('webpackJsonp_tinydoc', global.window.webpackJsonp_tinydoc);
  fakeWindowContext.expose('console.debug', Function.prototype);

  var corpus = compiler.corpus.toJSON();

  // TODO DRY alert, see HTMLSerializer__write.js
  var pluginScripts = [
    'config.js', 'tinydoc__vendor.js', 'tinydoc.js'
  ].concat(compiler.assets.pluginScripts.map(function(filePath) {
    return 'plugins/' + path.basename(filePath);
  }));

  // TODO DRY alert, see HTMLSerializer__write.js
  window.CONFIG = _.extend({}, config, {
    version: require('../package').version,
    pluginCount: compiler.assets.pluginScripts.length,
    pluginConfigs: compiler.assets.runtimeConfigs,
    corpus: compiler.registry.getCorpus(),
    database: corpus,

    $static: {
      readyCallback: function(ui) {
        // console.log(JSON.stringify(ui.dumpRoutes()));
        var emitDocumentFile = DocumentFileEmitter({
          config: config,
          ui: ui,
          corpus: corpus,
          compiler: compiler,
          pluginScripts: pluginScripts,
          indexHtmlFile: indexHtmlFile,
        });

        async.eachSeries(Object.keys(corpus), emitDocumentFile, function(error) {
          console.log('> Cleaning up HTML-file emitting context...');

          fakeWindowContext.restore();

          compiler.assets.pluginScripts.concat([
            MAIN_BUNDLE,
            VENDOR_BUNDLE,
          ]).forEach(unloadModule);

          done(error);
          console.log('>> Done!');
        });
      },
    },
  });

  require(MAIN_BUNDLE);

  fakeWindowContext.expose('tinydoc', window.tinydoc);
  window.tinydoc.start();

  compiler.assets.pluginScripts.forEach(function(filePath) {
    require(filePath);
  });
};

function DocumentFileEmitter(params) {
  var compiler = params.compiler;
  var ui = params.ui;
  var corpus = params.corpus;
  var pluginScripts = params.pluginScripts;
  var indexHtmlFile = params.indexHtmlFile;

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

    var filePath = href.replace(/^\//, '');

    console.log('Emitting HTML file "%s" (URL: %s)', filePath, href);

    ui.render(href, function(err, html) {

      if (err) {
        console.warn("Unable to emit file for '%s': %s", node.uid, err);
        return done();
      }

      var distanceFromRoot = href.split('/').length - 1;
      var docHTML = indexHtmlFile({
        scripts: buildScriptList(pluginScripts, distanceFromRoot),
        styleSheets: buildScriptList([ K.STYLE_BUNDLE ], distanceFromRoot),
        title: node.title,
        metaDescription: node.summary,
        contents: html,
      });

      compiler.utils.writeAsset(filePath, docHTML);

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

function buildScriptList(list, distanceFromRoot) {
  if (distanceFromRoot < 1) {
    return list;
  }

  var relativePathPrefix = Array(distanceFromRoot).join('../');

  return list.map(function(filePath) {
    return relativePathPrefix + filePath;
  });
}

function unloadModule(fileName) {
  delete require.cache[require.resolve(fileName)];
}
