const { assign } = require('lodash');

/**
 * @module UI.Corpus
 *
 * To access these APIs from within your plugins, use the global instance found
 * at [tinydoc@corpus `window.tinydoc.corpus`]().
 */
function CorpusAPI(shallowCorpus) {
  const exports = {};
  const corpus = CorpusTree(shallowCorpus);
  const documentSearchIndex = buildDocumentSearchIndex();
  const documentEntitySearchIndex = buildDocumentEntitySearchIndex();
  const pluginNamespaces = Object.keys(corpus).reduce((map, x) => {
    const node = getByUID(x);

    if (node.type === 'Namespace') {
      if (!map[node.pluginName]) {
        map[node.pluginName] = [];
      }

      map[node.pluginName].push(node);
    }

    return map;
  }, {});

  const length = Object.keys(corpus).length;

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

  exports.getNamespacesForPlugin = function(pluginName) {
    return pluginNamespaces[pluginName] || [];
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

    // Ok, if we still didn't match any node but there's an anchor in the URL
    // it might be a URI to a Document and not a DocumentEntity, in which case
    // we only really care about the href fragment.
    //
    // This happens in SinglePageMode where we must use fully-qualified URIs
    // (i.e. both href + anchor).
    if (uri.indexOf('#') > -1) {
      const [ path, anchor ] = uri.split('#');
      const node = exports.getByURI(path);

      if (node && node.meta.anchor === anchor) {
        return node;
      }
    }
  };

  Object.defineProperty(exports, 'length', {
    configurable: false,
    writable: false,
    value: length
  });

  /**
   * @param  {String} uid
   * @return {T.Namespace}
   */
  exports.getNamespaceOfDocument = getNamespaceOfDocument;

  function getNamespaceOfDocument(uid) {
    let node = typeof uid === 'string' ? getByUID(uid) : uid;

    if (node) {
      return getNamespaceOfNode(node);
    }
  }

  function getByUID(uid) {
    return corpus[uid];
  }

  function getPrivateIndex(node) {
    if (node.meta.indexDisplayName) {
      return node.meta.indexDisplayName;
    }

    for (let index in node.indices) {
      if (node.indices[index] === 1) {
        return index;
      }
    }
  }

  function buildDocumentSearchIndex() {
    return Object.keys(corpus).filter(uid => !!getHref(corpus[uid])).map(uid => {
      const node = corpus[uid];

      return {
        $1: node.title,
        $2: node.filePath,
        link: {
          href: getHref(node),
          anchor: getAnchor(node),
          context: getContext(node)
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
                href: getHref(x),
                anchor: getAnchor(x),
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

function getAnchor(node) {
  return node.meta.anchor;
}

function getContext(targetNode) {
  let node = targetNode;

  do {
    if (node.meta.corpusContext) {
      return node.meta.corpusContext;
    }

    node = node.parentNode;
  } while (node && node.type !== 'Namespace');

  return node ? node.title : null;
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

function getNamespaceOfNode(rootNode) {
  let node = rootNode;

  while (node.type !== 'Namespace' && node.parentNode) {
    node = node.parentNode;
  }

  if (node.type === 'Namespace') {
    return node;
  }
}

module.exports = CorpusAPI;
module.exports.getNamespaceOfNode = getNamespaceOfNode;