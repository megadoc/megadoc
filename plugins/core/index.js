var write = require('./write');
var parseGitStats = require('../../lib/utils/parseGitStats');
var fs = require('fs');

exports.name = 'CorePlugin';
exports.run = function(compiler) {
  var config = compiler.config;
  var utils = compiler.utils;
  var database = {};

  compiler.on('scan', function(done) {
    if (config.gitStats && config.readme) {
      var filePaths = [ utils.getAssetPath(config.readme) ];

      parseGitStats(config.gitRepository, filePaths, function(err, stats) {
        if (err) {
          return done(err);
        }

        database.readmeGitStats = stats[0];
        done();
      });
    }
    else {
      done();
    }
  });

  compiler.on('render', function(renderMarkdown, linkify, done) {
    if (config.readme) {
      database.readme = renderMarkdown.withTOC(
        linkify(
          fs.readFileSync(compiler.utils.getAssetPath(config.readme), 'utf-8')
        ), {
          baseURL: '/readme'
        }
      );
    }

    if (config.footer) {
      database.footer = renderMarkdown(linkify(config.footer));
    }

    done();
  });

  compiler.on('write', function(done) {
    write(config, compiler, database, done);
  });
};
