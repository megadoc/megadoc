var write = require('./HTMLSerializer__write');
var emitFiles = require('./HTMLSerializer__emitFiles');
var async = require('async');

exports.name = 'HTMLPlugin';
exports.run = function(compiler) {
  var config = compiler.config;
  var database = {};

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
