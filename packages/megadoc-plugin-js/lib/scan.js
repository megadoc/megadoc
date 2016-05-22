var Parser = require('./Parser');
var K = require('./Parser/constants');

module.exports = function scan(params, done) {
  var database;
  var config = params.config;
  var parserConfig = params.parserConfig;
  var files = params.utils.globAndFilter(config.source, config.exclude);

  if (config.verbose) {
    console.log('megadoc-plugin-js[%s]: Parsing docs from %d files.', config.routeName, files.length);
  }

  var parser = new Parser();

  files.forEach(function(filePath) {
    parser.parseFile(filePath, parserConfig, params.assetRoot);
  });

  database = parser.toJSON();

  if (parserConfig.postProcessors) {
    parserConfig.postProcessors.forEach(function(postProcessor) {
      postProcessor(database);
    });
  }

  warnAboutOrphans(database);
  warnAboutUnknownContexts(database);

  done(null, database);
};


function warnAboutOrphans(database) {
  var ids = database.reduce(function(map, doc) {
    map[doc.id] = true;
    return map;
  }, {});

  database.forEach(function(doc) {
    if (!doc.isModule && (!doc.receiver || !(doc.receiver in ids))) {
      console.warn(
        'Unable to map "%s" to any module, it will be discarded. (Source: %s)',
        doc.id,
        doc.nodeInfo.fileLoc
      );
    }
  })
}

function warnAboutUnknownContexts(database) {
  database.forEach(function(doc) {
    if (doc.type === K.TYPE_UNKNOWN) {
      console.info(
        'Entity "%s" has no context. This probably means megadoc does not know ' +
        'how to handle it yet. (Source: %s)',
        doc.id,
        doc.nodeInfo.fileLoc
      );
    }
  });
}