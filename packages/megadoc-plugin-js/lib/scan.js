var Parser = require('./Parser');

module.exports = function scan(params, done) {
  var database;
  var config = params.config;
  var parserConfig = params.parserConfig;
  var files = params.utils.globAndFilter(config.source, config.exclude);

  if (config.verbose) {
    console.log('tinydoc-plugin-js[%s]: Parsing docs from %d files.', config.routeName, files.length);
  }

  var parser = new Parser();

  files.forEach(function(filePath) {
    parser.parseFile(filePath, parserConfig, params.assetRoot);
  });

  parser.seal(parserConfig);

  database = parser.toJSON();

  if (parserConfig.postProcessors) {
    parserConfig.postProcessors.forEach(function(postProcessor) {
      postProcessor(database);
    });
  }

  done(null, database);
};
