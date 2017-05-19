const K = require('jsdoc-parser-extended').Constants;

module.exports = function refineFn(context, documents, done) {
  // console.log('[D] Sealing %d documents', documents.length);

  var config = context.options;

  var namespaceIds =  documents.reduce(function(map, node) {
    if (node.namespace && !documents.some(x => x.id === node.namespace)) {
      map[node.namespace] = node;
    }

    return map;
  }, {});

  var namespaceDocuments = Object.keys(namespaceIds).map(function(namespaceId) {
    var referencingDocument = namespaceIds[namespaceId];

    return {
      isNamespace: true,
      id: namespaceId,
      title: namespaceId,
      filePath: referencingDocument.filePath, // useful for error reporting when there's a UID clash
      loc: referencingDocument.loc,
      tags: [],
    };
  })

  var withNamespaces = documents.concat(namespaceDocuments);

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
      !doc.isModule &&
      !doc.isNamespace &&
      (!doc.receiver || !idMap.hasOwnProperty(doc.receiver))
    );

    if (isOrphan && shouldWarn) {
      console.warn(
        '%s: Unable to map "%s" to any module, it will be discarded.',
        dumpDocPath(doc),
        doc.id
      );
    }

    return !isOrphan;
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
    if (doc && doc && doc.tags) {
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