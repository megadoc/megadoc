const { assign } = require('lodash');

/**
 * @module UI.Corpus
 *
 * To access these APIs from within your plugins, use the global instance found
 * at [tinydoc@corpus `window.tinydoc.corpus`]().
 */
module.exports = function CorpusAPI(shallowCorpus) {
  const exports = {};
  const corpus = CorpusTree(shallowCorpus);
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

  exports.getCatalogue = function(id) {
    return Object.keys(corpus).filter(x => x.indexOf(id + '/') === 0).map(getByUID);
  };

  exports.get = function(uid) {
    return corpus[uid];
  };

  exports.getByURI = function(uri) {
    for (let uid in corpus) {
      if (getHref(corpus[uid]) === uri) {
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
    return Object.keys(corpus).filter(uid => !!getHref(corpus[uid])).map(uid => {
      const node = corpus[uid];
      const namespaceNode = getNamespaceOfDocument(uid);

      if (!namespaceNode) {
        // console.warn(`CorpusIntegrityError: Document '${uid}' has no namespace!`);
      }

      return {
        $1: node.title,
        $2: node.filePath,
        link: {
          href: getHref(node),
          context: namespaceNode && namespaceNode.corpusContext
        }
      }
    });
  }

  function buildDocumentEntitySearchIndex() {
    return Object.keys(corpus)
      .filter(uid => !!getHref(corpus[uid]) && corpus[uid].type === 'Document')
      .reduce((map, uid) => {
        const node = getByUID(uid);

        if (!node.entities) {
          map[uid] = [];
        }
        else {
          map[uid] = node.entities.filter(getHref).map(x => {
            return {
              $1: getPrivateIndex(x),
              link: {
                href: getHref(x)
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

function getHref(node) {
  return node.meta.href;
}

function CorpusTree(corpus) {
  const corpusTree = Object.keys(corpus).reduce(function(map, uid) {
    map[uid] = discardChildReferences( assign({}, corpus[uid]) );

    return map;
  }, {});

  Object.keys(corpusTree).forEach(reduceNode);

  return corpusTree;

  function reduceNode(uid) {
    const node = corpusTree[uid];

    if (typeof node.parentNode === 'string') {
      attach(node, corpusTree[node.parentNode]);
    }
  }

  function attach(node, parentNode) {
    let set;

    // TODO: this needs to be generalized
    if (parentNode.type === 'Namespace') {
      if (node.type === 'Document') {
        set = 'documents';
      }
    }
    else if (parentNode.type === 'Document') {
      if (node.type === 'DocumentEntity') {
        set = 'entities';
      }
      else if (node.type === 'Document') {
        set = 'documents';
      }
    }

    if (set) {
      parentNode[set].push(node);
      node.parentNode = parentNode;
    }
    else {
      console.warn("Unable to attach corpus node of type '%s' to parent node of type '%s'",
        node.type,
        parentNode.type
      );
    }
  }

  function discardChildReferences(node) {
    if (node.type === 'Namespace') {
      node.documents = [];
    }
    else if (node.type === 'Document') {
      node.documents = [];
      node.entities = [];
    }

    return node;
  }
}