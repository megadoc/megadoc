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

  var parser = new Parser({ emitter: params.emitter });

  files.forEach(function(filePath) {
    parser.parseFile(filePath, parserConfig, params.assetRoot);
  });

  database = parser.toJSON();

  params.emitter.emit('postprocess', database);

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
        'Unable to map "%s" to any module, it will be discarded. (Source: %s:%s)',
        doc.id,
        doc.filePath,
        doc.line
      );
    }
  })
}

function warnAboutUnknownContexts(database) {
  database.forEach(function(doc) {
    if (!doc.type || doc.type === K.TYPE_UNKNOWN) {
      console.info(
        'Document "%s" is unidentified. This probably means megadoc does not ' +
        'know how to handle it yet. (Source: %s:%s)',
        doc.id,
        doc.filePath, doc.line
      );
    }
  });
}