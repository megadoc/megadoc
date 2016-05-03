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
        if (config.emitFiles) {
          emitFiles(config, compiler, thisOneDone);
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
