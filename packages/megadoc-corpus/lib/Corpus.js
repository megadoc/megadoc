var assert = require('assert');
var resolveLink = require('./CorpusResolver');
var CorpusIndexer = require('./CorpusIndexer');
var Types = require('./CorpusTypes');
var integrityEnforcements = require('./CorpusIntegrityEnforcements');
var assign = require('object-assign');
var dumpNodeFilePath = require('./CorpusUtils').dumpNodeFilePath;
var b = Types.builders;

/**
 * @preserveOrder
 *
 * The Corpus public API.
 */
function Corpus(config) {
  const exports = {};
  const nodes = {};
  const paths = {};
  const nodeList = [];
  const corpusNode = b.corpus({
    meta: {},
    namespaces: [],
    indexFields: [ '$uid', '$filePath' ],
  });

  const buildIndices = CorpusIndexer(exports);

  config = config || {};

  /**
   * @method add
   *
   * Add a namespace or a document to the corpus. The corpus will be populated
   * with all offspring nodes (if applicable).
   *
   * Items added to the corpus will gain a UID and will be indexed.
   *
   * @example
   *
   *     corpus.add(b.namespace({
   *       id: 'JS',
   *       documents: [
   *         b.document({
   *           id: 'jQuery'
   *         })
   *       ]
   *     }))
   *
   * @param {T.Namespace|T.Node} node
   */
  exports.add = add;

  /**
   * Retrieve a document AST node by its UID.
   *
   * @param {String} uid
   *
   * @return {T.Namespace|T.Node}
   *         The document AST node, if found.
   */
  exports.get = function(uid) {
    return nodes[uid];
  };

  exports.at = function(path) {
    return paths[path];
  };

  exports.getParentOf = function(object) {
    if (object.type === 'Namespace') {
      return corpusNode;
    }
    else if (object.parentNodeId) {
      return nodes[object.parentNodeId];
    }

    return null;
  };

  /**
   * Resolve a link to a document.
   *
   * @param {Object} anchor
   * @param {T.Node} [anchor.contextNode]
   *        The contextNode we're resolving from. Defaults to the root corpus
   *        node.
   *
   * @param {String} anchor.text
   *        The term to use for looking up the document.
   *
   * @return {T.Node}
   */
  exports.resolve = function(anchor) {
    if (nodes.hasOwnProperty(anchor.text)) {
      return nodes[anchor.text];
    }
    else if (paths.hasOwnProperty(anchor.text)) {
      return paths[anchor.text];
    }

    const withContextNode = Object.assign({}, anchor, {
      contextNode: anchor.contextNode || corpusNode
    });

    return resolveLink(withContextNode, { getParentOf: exports.getParentOf });
  };

  /**
   * @private
   */
  exports.dump = function() {
    return {
      uids: Object.keys(nodes),
      paths: Object.keys(paths),
    };
  };

  /**
   * Define an alias for a document.
   *
   * @param {String} uid
   *        The UID of the node to alias.
   *
   * @param {String} alias
   *        The alias to use (should be fully-qualified.)
   */
  exports.alias = function(path, alias) {
    const node = exports.at(path);

    assert(!!node,
      "ArgumentError: attempting to alias a node '" + path + "' to '" + alias + "' but no such node exists." +
      (config.debug ? "\nAvailable UIDs:\n" + JSON.stringify(Object.keys(nodes), null, 2) : '')
    );

    node.indices[alias] = 1;
  };

  /**
   * Serialize the Corpus to a flat JSON map with no circular dependencies.
   *
   * @return {Object}
   *         An object that can be safely serialized to disk.
   */
  exports.toJSON = function() {
    return nodeList.reduce(function(map, node) {
      map[getUID(node)] = flattenNodeAndChildren(exports, node);
      return map;
    }, {});
  };

  /**
   * Install a Node visitor that will be called any time a node of the specified
   * type is added to the corpus.
   *
   * @param {Object.<String, Corpus~Visitor>} visitor
   *        A map of node types as keys and functions as values.
   *
   * @example
   *
   * ```javascript
   * corpus.visit({
   *   Document: function(node) {
   *     if (node.filePath.match(/foo.js/)) {
   *       node.meta.isFoo = true;
   *     }
   *   }
   * });
   * ```
   *
   * @callback Corpus~Visitor
   * @param {T.Namespace|T.Node} node
   */
  exports.traverse = function traverse(visitor, node) {
    if (arguments.length === 1) {
      Object.keys(visitor).forEach(function(typeName) {
        assert(Types.isTypeKnown(typeName),
          "ArgumentError: a visitor was defined for an unknown node type '" + typeName + "'."
        );
      });

      return traverse(visitor, corpusNode);
    }

    const traversalContext = {
      getParentOf: exports.getParentOf
    };

    Types.getTypeChain(node.type)
      .map(typeName => visitor[typeName] || Function.prototype)
      .forEach(fn => fn(node, traversalContext))
    ;

    if (node.namespaces) { // Corpus
      node.namespaces.forEach(traverse.bind(null, visitor));
    }

    if (node.documents) { // Namespace | Document
      node.documents.forEach(traverse.bind(null, visitor));
    }

    if (node.entities) { // Document
      node.entities.forEach(traverse.bind(null, visitor));
    }
  };

  function add(node, parentNode) {
    if (node.type === 'Namespace') {
      assert(corpusNode.namespaces.map(function(x) { return x.id; }).indexOf(node.id) === -1,
        "IntegrityViolation: a namespace with the id '" + node.id + "' already exists."
      );

      assert(hasValidNamespaceId(node),
        'IntegrityViolation: a namespace id may not start with "/" ' +
        '(forward slash) or "." (dot) characters.'
      );

      corpusNode.namespaces.push(node);
    }
    else if (parentNode) {
      node.parentNodeId = parentNode.uid;
    }
    else {
      assert(node.parentNodeId,
        `IntegrityViolation: expected node to reference a parentNode. (Source: ${dumpNodeFilePath(node)})`
      );
    }

    if (node.type === 'Namespace' || node.type === 'Document') {
      node.symbol = node.hasOwnProperty('symbol') ? node.symbol : '/';
    }

    if (!node.meta) {
      node.meta = {};
    }

    integrityEnforcements.apply(node);

    node.path = generateNodePath(exports, node);
    node.indices = Object.assign({}, buildIndices(node, { getParentOf: exports.getParentOf }), node.indices);

    if (nodes.hasOwnProperty(node.uid)) {
      lenientAssert(false,
        'IntegrityViolation: a node with the UID "' + (node.path || node.uid) + '" already exists.' +
        '\nPast definition: ' + dumpNodeFilePath(nodes[node.uid]) +
        '\nThis definition: ' + dumpNodeFilePath(node)
      );
    }

    nodes[node.uid] = node;
    paths[node.path] = node;
    nodeList.push(node);

    if (node.documents) { // Namespace | Document
      node.documents.forEach(x => add(x, node));
    }

    if (node.entities) { // Document
      node.entities.forEach(x => add(x, node));
    }

    return node;
  }

  function lenientAssert(expr, message) {
    if (config.strict !== false) {
      assert(expr, message);
    }
    else {
      if (!expr) {
        console.warn(message);
      }
    }
  }

  return exports;
};

function generateNodePath(corpus, sourceNode) {
  var fragments = [];
  var node = sourceNode;

  do {
    if (sourceNode !== node) {
      if (node.symbol) {
        fragments.unshift(node.symbol);
      }
    }

    if (node.id) {
      fragments.unshift(node.id);
    }
  } while ((node = corpus.getParentOf(node)));

  return fragments.join('');
}

function flattenNodeAndChildren(corpus, node) {
  var clone = assign({}, node);
  var flatNode = flattenNode(corpus, clone);

  if (node.documents) {
    flatNode.documents = node.documents.map(getUID);
  }

  if (node.entities) {
    flatNode.entities = node.entities.map(getUID);
  }

  return flatNode;
}

function flattenNode(corpus, node) {
  if (node.parentNodeId) {
    return assign(node, { parentNodeId: getUID(corpus.getParentOf(node)) });
  }
  else {
    return node;
  }
}

function getUID(node) {
  return node.path;
}

function hasValidNamespaceId(node) {
  return node.id && node.id[0] !== '/' && node.id[0] !== '.';
}

module.exports = Corpus;
module.exports.dumpNodeFilePath = dumpNodeFilePath;
module.exports.getUID = getUID;