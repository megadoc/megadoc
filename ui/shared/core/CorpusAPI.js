/**
 * @module UI.Corpus
 *
 * To access these APIs from within your plugins, use the global instance found
 * at [tinydoc@corpus `window.tinydoc.corpus`]().
 */
module.exports = function CorpusAPI(corpus) {
  const exports = {};
  const documentSearchIndex = buildDocumentSearchIndex();
  const documentEntitySearchIndex = buildDocumentEntitySearchIndex();

  exports.getDocumentSearchIndex = function() {
    return documentSearchIndex;
  };

  exports.getDocumentEntitySearchIndex = getDocumentEntitySearchIndex;

  function getDocumentEntitySearchIndex(uid) {
    const node = getByUID(uid);

    if (node && node.type === 'DocumentEntity') {
      return getDocumentEntitySearchIndex(node.parentNode);
    }

    return documentEntitySearchIndex[uid];
  };

  exports.get = function(uid) {
    return corpus[uid];
  };

  exports.getByURI = function(uri) {
    for (let uid in corpus) {
      if (corpus[uid].href === uri) {
        return corpus[uid];
      }
    }
  };

  exports.getEntities = function(uid) {
    const node = corpus[uid];

    if (!node) {
      console.warn("Document with the UID '%s' does not exist!", uid);
      return [];
    }

    if (node.entities) {
      return node.entities.map(x => corpus[x]);
    }
    else {
      return [];
    }
  };

  /**
   * @param  {String} uid
   * @return {T.Namespace}
   */
  exports.getNamespaceOfDocument = getNamespaceOfDocument;

  function getNamespaceOfDocument(uid) {
    return corpus[ uid.split('/')[0] ];
  }

  function getByUID(uid) {
    return corpus[uid];
  }

  function getPrivateIndex(node) {
    for (let index in node.indices) {
      if (node.indices[index] === 1) {
        return index;
      }
    }
  }

  function buildDocumentSearchIndex() {
    return Object.keys(corpus).filter(uid => !!corpus[uid].href).map(uid => {
      const node = corpus[uid];
      const namespaceNode = getNamespaceOfDocument(uid);

      if (!namespaceNode) {
        console.warn(`CorpusIntegrityError: Document '${uid}' has no namespace!`);
      }

      return {
        $1: node.title,
        $2: node.filePath,
        link: {
          href: node.href,
          context: namespaceNode && namespaceNode.corpusContext
        }
      }
    });
  }

  function buildDocumentEntitySearchIndex() {
    return Object.keys(corpus)
      .filter(uid => !!corpus[uid].href && corpus[uid].type === 'Document')
      .reduce((map, uid) => {
        const node = getByUID(uid);

        if (!node.entities) {
          map[uid] = [];
        }
        else {
          map[uid] = node.entities.map(getByUID).filter(x => x.href).map(x => {
            return {
              $1: getPrivateIndex(x),
              link: {
                href: x.href
              }
            };
          });
        }

        return map;
      }, {})
    ;
  }

  return exports;
};