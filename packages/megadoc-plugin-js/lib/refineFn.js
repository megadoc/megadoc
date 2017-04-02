const K = require('jsdoc-parser-extended').Constants;
const b = require('megadoc-corpus').builders;

module.exports = function refineFn(context, documents, done) {
  console.log('[D] Sealing %d documents', documents.length);

  var config = context.options;
  var emitter = context.state.emitter;

  var namespaceIds =  documents.reduce(function(map, node) {
    if (node.properties.namespace && !documents.some(x => x.id === node.properties.namespace)) {
      map[node.properties.namespace] = node;
    }

    return map;
  }, {});

  var namespaceDocuments = Object.keys(namespaceIds).map(function(namespaceId) {
    var referencingDocument = namespaceIds[namespaceId];

    return b.document({
      id: namespaceId,
      title: namespaceId,
      symbol: K.NAMESPACE_SEP,
      meta: {},
      filePath: referencingDocument.filePath, // useful for error reporting when there's a UID clash
      indexFields: [ '$uid', '$filePath', 'name', 'aliases' ],
      loc: referencingDocument.loc,
      properties: {
        isNamespace: true,
        tags: [],
      },
    });
  })

  var withNamespaces = documents.concat(namespaceDocuments);

  emitter.emit('postprocess', withNamespaces);

  var withoutOrphans = discardOrphans(withNamespaces, {
    warn: true,
  });

  if (config.verbose) {
    warnAboutUnknownContexts(withoutOrphans);
  }

  warnAboutUnknownTags(withoutOrphans, config);

  done(null, withoutOrphans);
};

function discardOrphans(database, options) {
  const shouldWarn = options.warn;

  const idMap = database.reduce(function(map, doc) {
    map[doc.id] = true;
    return map;
  }, {});

  return database.filter(function(doc) {
    const isOrphan = (
      !doc.properties.isModule &&
      !doc.properties.isNamespace &&
      (!doc.properties.receiver || !idMap.hasOwnProperty(doc.properties.receiver))
    );

    if (isOrphan && shouldWarn) {
      console.warn(
        '%s: Unable to map "%s" to any module, it will be discarded.',
        dumpDocPath(doc.properties),
        doc.id
      );
    }

    return !isOrphan;
  })
}

function warnAboutUnknownContexts(database) {
  database.forEach(function(doc) {
    if (!doc.properties.type || doc.properties.type === K.TYPE_UNKNOWN) {
      console.info(
        '%s: Document "%s" is unidentified. This probably means megadoc does not ' +
        'know how to handle it yet.',
        dumpDocPath(doc.properties),
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
    if (doc && doc.properties && doc.properties.tags) {
      doc.properties.tags.forEach(function(tag) {
        if (!(tag.type in KNOWN_TAGS)) {
          console.warn("%s: Unknown tag '%s'.",
            dumpDocPath(doc.properties),
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