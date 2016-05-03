var async = require('async');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var template = require('lodash').template;

module.exports = function(jsdom, config, compiler, done) {
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
  require('../dist/tinydoc__vendor');
  global.webpackJsonp_tinydoc = global.window.webpackJsonp_tinydoc;
  global.console.debug = Function.prototype;

  var corpus = compiler.corpus.toJSON();
  // TODO DRY alert, see HTMLSerializer__write.js
  var pluginScripts = [
    'styles.js', 'config.js', 'tinydoc__vendor.js', 'tinydoc.js'
  ].concat(compiler.assets.pluginScripts.map(function(filePath) {
    return 'plugins/' + path.basename(filePath);
  }));

  var staticPages = [
    {
      uid: '404',
      title: '404 - Not Found',
      summary: 'Not Found',
      href: '/404.html'
    }
  ];

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
        async.eachSeries(Object.keys(corpus).concat(staticPages), function(uid, thisOneDone) {
          var node = typeof uid === 'string' ? corpus[uid] : uid;

          if (!node.href) {
            console.log('Document "%s" has no @href - an HTML file will not be emitted.', uid);
            return thisOneDone();
          }
          else if (node.type === 'DocumentEntity') {
            return thisOneDone();
          }

          console.log('Emitting HTML file for "%s" (at: %s)', node.uid, node.href);

          ui.render(node.href, function(html) {
            var distanceFromRoot = node.href.split('/').length - 1;
            var docHTML = indexHtmlFile({
              scripts: buildScriptList(pluginScripts, distanceFromRoot),
              title: node.title,
              metaDescription: node.summary,
              contents: html,
            });

            compiler.utils.writeAsset(
              node.href.replace(/^\//, '') + config.emittedFileExtension,
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

  require('../dist/tinydoc');

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
