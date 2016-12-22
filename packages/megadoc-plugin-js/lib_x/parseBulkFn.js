var K = require('jsdoc-parser-extended').Constants;

module.exports = function parseBulkFn(context, filePaths, done) {
  var config = context.options;
  var parserConfig = context.state.parserConfig;
  var parser = context.state.parser;
  var emitter = context.state.emitter;

  filePaths.forEach(function(filePath) {
    parser.parseFile(filePath, parserConfig, context.commonOptions.assetRoot);
  });

  // omg OMG
  var database = parser.toJSON();
  var namespaceIds =  database.reduce(function(map, doc) {
    if (doc.namespace) {
      map[doc.namespace] = doc;
    }

    return map;
  }, {});

  var namespaceDocuments = Object.keys(namespaceIds).map(function(namespaceId) {
    var referencingDocument = namespaceIds[namespaceId];

    return {
      id: namespaceId,
      title: namespaceId,
      symbol: K.NAMESPACE_SEP,
      isNamespace: true,
      filePath: referencingDocument.filePath, // useful for error reporting when there's a UID clash
      loc: referencingDocument.loc,
    };
  })

  var withNamespaces = database.concat(namespaceDocuments);

  emitter.emit('postprocess', withNamespaces);

  warnAboutOrphans(withNamespaces);

  if (config.verbose) {
    warnAboutUnknownContexts(withNamespaces);
  }

  warnAboutUnknownTags(withNamespaces, config);

  done(null, withNamespaces);
};

function warnAboutOrphans(database) {
  var ids = database.reduce(function(map, doc) {
    map[doc.id] = true;
    return map;
  }, {});

  database.forEach(function(doc) {
    if (!doc.isModule && (!doc.receiver || !(doc.receiver in ids))) {
      console.warn(
        '%s: Unable to map "%s" to any module, it will be discarded.',
        dumpDocPath(doc),
        doc.id
      );
    }
  })
}

function warnAboutUnknownContexts(database) {
  database.forEach(function(doc) {
    if (!doc.type || doc.type === K.TYPE_UNKNOWN) {
      console.info(
        '%s: Document "%s" is unidentified. This probably means megadoc does not ' +
        'know how to handle it yet.',
        dumpDocPath(doc),
        doc.id
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
          console.warn("%s: Unknown tag '%s'.",
            dumpDocPath(doc),
            tag.type
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

function dumpDocPath(doc) {
  return doc.filePath + (doc.line ? (':' + doc.line) : '');
}