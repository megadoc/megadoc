var Parser = require('./Parser');
var defaults = require('./config');
var path = require('path');
var merge = require('lodash').merge;
var root = path.resolve(__dirname, '..');

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

        database = files.reduce(function(set, file) {
          return set.concat(
            Parser.parseFile(file).map(function(doc) {
              doc.filePath = file.replace(assetRoot, '');
              return doc;
            })
          );
        }, []);

        compiler.linkResolver.use(resolveLink);

        done();
      });

      compiler.on('index', function(registry, done) {
        database.forEach(function(doc) {
          var index = {
            type: 'lua',
            routeName: config.routeName,
            path: doc.path
          };

          registry.add(doc.path, index);

          if (config.indexByFileNames && doc.isModule) {
            registry.add(doc.filePath, index);
            registry.add(doc.filePath.replace(/^\//, ''), index);
          }
        });

        done();
      });

      compiler.on('render', function(markdown, linkify, done) {
        database.forEach(function(doc) {
          doc.description = markdown(linkify(doc.description, doc.receiver || doc.id));
          doc.tags.forEach(function(tag) {
            tag.description = markdown(linkify(tag.description, doc.receiver || doc.id));
          })
        });

        done();
      });

      compiler.on('generateStats', function(stats, done) {
        stats['lua:' + config.routeName] = {
          moduleCount: database.length
        };

        done();
      });

      compiler.on('write', function(done) {
        compiler.assets.addPluginRuntimeConfig('lua', {
          routeName: config.routeName,
          title: config.title,
          sidebarTitle: config.sidebarTitle,
          database: database
        });

        compiler.assets.addStyleSheet(path.join(root, 'ui', 'css', 'index.less'));
        compiler.assets.addPluginScript(path.join(root, 'dist', 'tinydoc-plugin-lua.js'));
        done();
      });

      function resolveLink(id, registry, currentModuleId) {
        var index = registry.get(id);

        if (!index && currentModuleId) {
          var entityDoc = database.filter(function(doc) {
            return (
              doc.id === id && doc.receiver === currentModuleId ||
              doc.path === (currentModuleId + id)
            );
          })[0];

          if (entityDoc) {
            index = registry.get(entityDoc.path);
          }
        }

        if (!index || index.type !== 'lua' || index.routeName !== config.routeName) {
          return;
        }

        var doc = database.filter(function(d) {
          return d.path === index.path;
        })[0];

        var urlPath, title;

        if (doc.isModule) {
          urlPath = encodeURIComponent(doc.id);
          title = doc.id;
        }
        else {
          urlPath = encodeURIComponent(doc.receiver) + '/' + encodeURIComponent(doc.symbol + doc.id);

          if (currentModuleId === doc.receiver) {
            title = doc.symbol + doc.id;
          }
          else {
            title = doc.path;
          }
        }

        return {
          title: title,
          href: config.routeName + '/' + urlPath
        };
      }

      return function() {
        return database;
      };
    }
  };
};
