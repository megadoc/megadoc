var Parser = require('./Parser');
var K = require('./Parser/constants');
var DocUtils = require('./Parser/DocUtils');

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
  warnAboutUnknownTags(database, config);

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

function warnAboutUnknownTags(database, config) {
  var KNOWN_TAGS = combine([
    config.customTags || {},
    K.KNOWN_TAGS.reduce(function(map, x) { map[x] = true; return map; }, {})
  ]);

  database.forEach(function(doc) {
    if (doc && doc.tags) {
      doc.tags.forEach(function(tag) {
        if (!(tag.type in KNOWN_TAGS)) {
          console.warn("Unknown tag '%s'. (Source: %s)",
            tag.type,
            (doc.filePath + (doc.line ? (':' + doc.line) : ''))
          );
        }
      });
    }
  });
}

function combine(maps) {
  return maps.reduce(function(map, x) {
    Object.keys(x).forEach(function(y) {
      if (!map[y]) {
        map[y] = true;
      }
    });

    return map;
  }, {});
}