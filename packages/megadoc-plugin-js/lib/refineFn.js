const K = require('jsdoc-parser-extended').Constants;
const Linter = require('megadoc-linter');
const { NoOrphans, NoUnknownTags, NoUnknownNodes, } = require('./lintingRules');

const debugLog = function() {
  if (process.env.MEGADOC_DEBUG === '1') {
    console.log.apply(console, arguments)
  }
}

module.exports = function refineFn(context, documents, done) {
  debugLog('Sealing %d documents', documents.length);

  const config = context.options;
  const linter = Linter.for(context.compilerOptions)

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
  var withoutOrphans = discardOrphans(linter, withNamespaces);

  if (config.verbose) {
    warnAboutUnknownContexts(linter, withoutOrphans);
  }

  warnAboutUnknownTags(linter, config, withoutOrphans);

  debugLog('Post-sealing: %d documents', withoutOrphans.length);

  done(null, withoutOrphans);
};

function discardOrphans(linter, database) {
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

    if (isOrphan) {
      linter.logRuleEntry({
        rule: NoOrphans,
        params: doc,
        loc: getDocLocation(doc)
      })
    }

    return !isOrphan;
  })
}

function warnAboutUnknownContexts(linter, database) {
  database.forEach(function(doc) {
    if (!doc.type || doc.type === K.TYPE_UNKNOWN) {
      linter.logRuleEntry({
        rule: NoUnknownNodes,
        params: doc,
        loc: getDocLocation(doc)
      });
    }
  });
}

function warnAboutUnknownTags(linter, config, database) {
  var KNOWN_TAGS = combine([
    config.customTags || {},
    K.KNOWN_TAGS.reduce(function(map, x) { map[x] = true; return map; }, {})
  ]);

  database.forEach(function(doc) {
    if (doc && doc && doc.tags) {
      doc.tags.forEach(function(tag) {
        if (!(tag.type in KNOWN_TAGS)) {
          linter.logRuleEntry({
            rule: NoUnknownTags,
            params: tag,
            loc: getDocLocation(doc)
          });
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

function getDocLocation(doc) {
  return {
    filePath: doc.filePath,
    line: doc.line
  }
}