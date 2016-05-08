var write = require('./HTMLSerializer__write');
var emitFiles = require('./HTMLSerializer__emitFiles');
var async = require('async');
var b = require('tinydoc-corpus').Types.builders;

module.exports = function(config) {
  var exports = {};

  exports.name = 'tinydoc-serializer-html';
  exports.run = function(compiler) {
    var database = {};

    compiler.corpus.visit(require('./HTMLSerializer__CorpusVisitor')(config));

    compiler.on('index', exports.index.bind(null, compiler));

    compiler.on('render', function(renderMarkdown, linkify, done) {
      if (config.footer) {
        database.footer = renderMarkdown(linkify(config.footer));
      }

      done();
    });

    compiler.on('write', function(done) {
      async.parallel([
        function(thisOneDone) {
          var jsdom;

          if (config.emitFiles) {
            try {
              jsdom = require('jsdom');
            }
            catch(_) {
              console.warn(
                "You do not have jsdom installed, which is required for the " +
                "@emitFiles option. jsdom requires Node v4.0 or later. Please " +
                "make sure it is installed and try again."
              );

              return thisOneDone();
            }

            emitFiles(jsdom, config, compiler, thisOneDone);
          }
          else {
            thisOneDone();
          }
        },

        function(thisOneDone) {
          write(config, compiler, database, thisOneDone);
        }
      ], done);
    });
  };

  exports.index = function(compiler, registry, done) {
    compiler.corpus.add(b.namespace({
      id: 'ui',
      meta: {
        href: null
      },
      documents: [
        b.document({
          id: '404',
          title: '404 - Not Found',
          summary: 'Not Found',
          meta: {
            href: '/404'
          },
        })
      ]
    }));

    done();
  };

  return exports;
};