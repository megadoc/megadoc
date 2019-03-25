const console = require("console");
const { assign } = require('lodash');

/**
 * To access these APIs from within your plugins, use the instance found on
 * React's context by the name of "corpus".
 *
 * For example:
 *
 *     React.createClass({
 *       contextTypes: {
 *         corpus: PropTypes.object
 *       },
 *
 *       render() {
 *         console.log(this.context.corpus.get('/index.html'));
 *       }
 *     })
 */
function CorpusAPI({ database: shallowCorpus, redirect }) {
  const exports = {};
  const corpus = CorpusTree(shallowCorpus);
  const { pathMap, filePathMap, hrefMap } = shallowCorpus.reduce((map, { uid }) => {
    const node = getByUID(uid);
    const href = getHref(node)

    map.pathMap[node.path] = node;

    if (!map.hrefMap[href]) {
      map.hrefMap[href] = []
    }

    map.hrefMap[href].push(node);

    if (node.type !== 'DocumentEntity') {
      map.filePathMap[node.filePath] = node;
    }

    return map;
  }, { pathMap: {}, filePathMap: {}, hrefMap: {} });

  const documentSearchIndex = buildDocumentSearchIndex();
  const documentEntitySearchIndex = buildDocumentEntitySearchIndex();
  const rewrittenDocuments = shallowCorpus.reduce((map, { uid }) => {
    const node = getByUID(uid);

    if (node.meta.hrefRewritten) {
      map[node.meta.href] = node;
    }

    return map;
  }, {});

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

  exports.get = function(path) {
    return pathMap[path];
  };

  exports.getByURI = function(uri) {
    if (redirect && redirect.hasOwnProperty(uri)) {
      return exports.getByURI(redirect[uri]);
    }

    if (rewrittenDocuments.hasOwnProperty(uri)) {
      return rewrittenDocuments[uri];
    }

    if (hrefMap.hasOwnProperty(uri)) {
      // prefer Document nodes first if nodes are competing for a url (like
      // /index.html)
      return hrefMap[uri].sort(a => a.type === 'Document' ? -1 : 1)[0];
    }

    // Ok, if we still didn't match any node but there's an anchor in the URL
    // it might be a URI to a Document and not a DocumentEntity, in which case
    // we only really care about the href fragment.
    //
    // This happens in SinglePageMode where we must use fully-qualified URIs
    // (i.e. both href + anchor).
    if (uri.indexOf('#') > -1) {
      const [ pathname, anchor ] = uri.split('#');
      const node = exports.getByURI(pathname);

      if (node && node.meta.anchor === anchor) {
        return node;
      }
    }
  };

  exports.getByFilePath = function(filePath) {
    return filePathMap[filePath];
  };

  exports.getByUID = getByUID

  Object.defineProperty(exports, 'length', {
    configurable: false,
    writable: false,
    value: shallowCorpus.length
  });

  exports.getNamespaceOfDocument = getNamespaceOfDocument;

  exports.getHrefOfFirstAvailableNamespace = function() {
    if (exports.getByURI('/index.html')) {
      return '/index.html'
    }

    return shallowCorpus.reduce((href, node) => {
      if (href) {
        return href
      }
      else {
        return getHref(node)
      }
    }, null)
  };

  /**
   * @memberOf CorpusAPI
   *
   * @param  {String} uid
   * @return {T.Namespace}
   */
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
    return shallowCorpus.filter(({ uid }) => {
      const node = getByUID(uid);

      return (
        !!getHref(node) &&
        // ignore documents that have no indices
        Object.keys(node.indices).length > 0
      );
    }).map(({ uid }) => {
      const node = getByUID(uid);

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
    return shallowCorpus
      .filter(({ uid }) => !!getHref(corpus[uid]) && corpus[uid].type === 'Document')
      .reduce((map, { uid }) => {
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
    if (node.meta && node.meta.corpusContext) {
      return node.meta.corpusContext;
    }

    node = node.parentNode;
  } while (node && node.type !== 'Namespace');

  return node ? node.title : null;
}

function CorpusTree(corpus) {
  const corpusTree = corpus.reduce(function(map, node) {
    map[node.uid] = discardChildReferences(assign({}, node));

    return map;
  }, {});

  corpus.forEach(reduceNode);

  return corpusTree;

  function reduceNode({ uid }) {
    const node = corpusTree[uid];

    if (typeof node.parentNodeUID === 'string') {
      attach(node, corpusTree[node.parentNodeUID]);
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
    else if (parentNode.type === 'DocumentEntity') {
      set = 'entities'
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
    else if (node.type === 'DocumentEntity') {
      node.entities = []
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

function getDocumentOfNode(rootNode) {
  let node = rootNode;

  while (node.type !== 'Document' && node.parentNode) {
    node = node.parentNode;
  }

  if (node.type === 'Document') {
    return node;
  }
}

module.exports = CorpusAPI;
module.exports.getNamespaceOfNode = getNamespaceOfNode;
module.exports.getDocumentOfNode = getDocumentOfNode;
module.exports.hrefOf = getHref;