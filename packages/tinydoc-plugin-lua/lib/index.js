var Parser = require('./Parser');
var defaults = require('./config');
var path = require('path');
var merge = require('lodash').merge;
var root = path.resolve(__dirname, '..');
var b = require('tinydoc-corpus').builders;

module.exports = function LuaPlugin(userConfig) {
  var config = merge({}, defaults, userConfig);

  return {
    configure: function(customConfig) {
      merge(config, customConfig);
    },

    run: function(compiler) {
      var utils = compiler.utils;
      var database;

      compiler.on('scan', function(done) {
        var files = utils.globAndFilter(config.source, config.exclude);
        var assetRoot = compiler.config.assetRoot;

        var documents = files.reduce(function(set, file) {
          return set.concat(Parser.parseFile(file).map(function(doc) {
            doc.filePath = file.replace(assetRoot, '');
            return doc;
          }));
        }, []);

        database = b.namespace({
          id: config.routeName,
          name: 'tinydoc-plugin-lua',
          title: config.title,
          config: config,
          documents: documents
            .filter(function(x) { return !x.receiver; })
            .map(reduceModule(documents))
        });

        compiler.corpus.add(database);

        done();
      });

      compiler.on('render', function(markdown, linkify, done) {
        database.documents.forEach(function(node) {
          renderDoc(node);

          node.entities.forEach(renderDoc);
        });

        function renderDoc(documentNode) {
          var doc = documentNode.properties;

          doc.description = markdown(linkify({ text: doc.description, contextNode: documentNode }));
          doc.tags.forEach(function(tag) {
            tag.description = markdown(linkify({ text: tag.description, contextNode: documentNode }));
          });
        }

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats['lua:' + config.routeName] = {
          moduleCount: database.documents.length
        };

        done();
      });

      compiler.on('write', function(done) {
        // compiler.assets.addPluginRuntimeConfig('lua', {
        //   routeName: config.routeName,
        //   title: config.title,
        //   sidebarTitle: config.sidebarTitle,
        //   database: database
        // });

        compiler.assets.addStyleSheet(path.join(root, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript(path.join(root, 'dist', 'tinydoc-plugin-lua.js'));
        done();
      });

      return function() {
        return database;
      };
    }
  };
};

function reduceModule(documents) {
  return function(doc) {
    return b.document({
      id: doc.id,
      title: doc.id,
      filePath: doc.filePath,
      properties: doc,
      entities: documents.filter(function(x) {
        return x.receiver === doc.id;
      }).map(reduceEntity)
    })
  };
}

function reduceEntity(doc) {
  return b.documentEntity({
    id: doc.id,
    title: doc.id,
    properties: doc
  })
}