var jsdom = require('jsdom');
var async = require('async');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var template = require('lodash').template;

module.exports = function(config, compiler, done) {
  var indexHtmlFile = template(fs.readFileSync(config.htmlFile, 'utf-8'));
  var dom = jsdom.jsdom(indexHtmlFile({
    scripts: [],
    title: null,
    metaDescription: null,
    contents: null,
  }));
  var window = dom.defaultView;
  var fakeWindowContext = FakeWindowContext(window);

  window.localStorage = {
    setItem: function() {},
    removeItem: function() {},
    clear: function() {}
  };

  fakeWindowContext.install(global);
  require('../dist/vendor');
  global.webpackJsonp_tinydoc = global.window.webpackJsonp_tinydoc;
  global.console.debug = Function.prototype;

  var corpus = compiler.corpus.toJSON();
  var pluginScripts = [
    'styles.js', 'config.js', 'vendor.js', 'main.js'
  ].concat(compiler.assets.pluginScripts.map(function(filePath) {
    return 'plugins/' + path.basename(filePath);
  }));

  window.CONFIG = _.extend(_.omit(config, [
    'plugins', 'assets',
  ]), {
    version: require('../package').version,
    pluginCount: compiler.assets.pluginScripts.length,
    pluginConfigs: compiler.assets.runtimeConfigs,
    corpus: compiler.registry.getCorpus(),
    database: corpus,

    $static: {
      readyCallback: function(ui) {
        async.eachSeries(Object.keys(corpus), function(uid, thisOneDone) {
          var node = corpus[uid];

          if (!node.href) {
            console.log('Document "%s" has no @href - an HTML file will not be emitted.', uid);
            return thisOneDone();
          }

          console.log('Emitting HTML file for "%s" (at: %s)', uid, node.href);

          ui.render(node.href, function(html) {
            var distanceFromRoot = node.href.split('/').length - 1;
            var docHTML = indexHtmlFile({
              scripts: buildScriptList(pluginScripts, distanceFromRoot),
              title: node.title,
              metaDescription: node.summary,
              contents: html,
            });

            compiler.utils.writeAsset(node.href.replace(/^\//, '') + '.html',
              docHTML
            );

            thisOneDone();
          });
        }, function(err) {
          done(err);
        });
      },
    },
  });

  require('../dist/main');

  global.tinydoc = window.tinydoc;

  compiler.assets.pluginScripts.forEach(function(filePath) {
    require(filePath);
  });
};

function FakeWindowContext(window) {
  var muddied = [];

  return {
    install: function(target) {
      target.window = window;

      for (var key in window) {
        if (window.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
          target[key] = window[key];
          muddied.push(key);
        }
      }
    },

    restore: function(target) {
      delete target['window'];

      muddied.forEach(function(key) {
        delete target[key];
      });

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

function getDocumentTitle() {
  return window.document.documentElement.querySelector('head title').textContent;
}

function getMetaDescription() {
  return window.document.documentElement.querySelector('head meta[name="description"]').content;
}