var write = require('./write');

exports.name = 'CorePlugin';
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
    write(config, compiler, database, done);
  });
};
