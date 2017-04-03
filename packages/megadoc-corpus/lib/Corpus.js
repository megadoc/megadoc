var assert = require('assert');
var resolveLink = require('./CorpusResolver');
var buildIndices = require('./CorpusIndexer');
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
  var exports = {};
  var nodes = {};
  var corpusNode = b.corpus({
    meta: {},
    namespaces: [],
    indexFields: [ '$uid', '$filePath' ],
  });

  var visitors = {};

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

  exports.getByValue = function(node) {
    return exports.get(UID(node));
  };

  exports.getNamespaceNodes = function() {
    return corpusNode.namespaces;
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
    if (anchor.text in nodes) {
      return nodes[anchor.text];
    }

    return resolveLink(anchor.contextNode ? anchor : {
      text: anchor.text,
      contextNode: corpusNode
    });
  };

  /**
   * @private
   */
  exports.dump = function() {
    return {
      uids: Object.keys(nodes),
      visitors: visitors
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
  exports.alias = function(uid, alias) {
    assert(uid in nodes,
      "ArgumentError: attempting to alias a node '" + uid + "' to '" + alias + "' but no such node exists." +
      (config.debug ? "\nAvailable UIDs:\n" + JSON.stringify(Object.keys(nodes), null, 2) : '')
    );

    nodes[uid].indices[alias] = 1;
  };

  /**
   * Serialize the Corpus to a flat JSON map with no circular dependencies.
   *
   * @return {Object}
   *         An object that can be safely serialized to disk.
   */
  exports.toJSON = function() {
    return Object.keys(nodes).reduce(function(map, uid) {
      map[uid] = flattenNodeAndChildren(nodes[uid]);
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
  exports.visit = function(visitor) {
    Object.keys(visitor).forEach(function(typeName) {
      assert(Types.isTypeKnown(typeName),
        "ArgumentError: a visitor was defined for an unknown node type '" + typeName + "'."
      );

      visitors[typeName] = visitors[typeName] || [];
      visitors[typeName].push(visitor[typeName]);
    });
  };

  function add(node) {
    if (node.type === 'Namespace') {
      assert(corpusNode.namespaces.map(function(x) { return x.id; }).indexOf(node.id) === -1,
        "IntegrityViolation: a namespace with the id '" + node.id + "' already exists."
      );

      assert(hasValidNamespaceId(node),
        'IntegrityViolation: a namespace id may not start with "/" ' +
        '(forward slash) or "." (dot) characters.'
      );

      corpusNode.namespaces.push(node);

      node.parentNode = corpusNode;
    }
    else {
      assert(node.parentNode,
        "IntegrityViolation: expected node to reference a parentNode."
      );
    }

    if (node.type === 'Namespace' || node.type === 'Document') {
      node.symbol = node.hasOwnProperty('symbol') ? node.symbol : '/';
    }

    if (!node.meta) {
      node.meta = {};
    }

    integrityEnforcements.apply(node);

    node.uid = UID(node);
    node.indices = buildIndices(node);

    Types.getTypeChain(node.type).forEach(function(typeName) {
      if (typeName in visitors) {
        visitors[typeName].forEach(function(fn) { fn(node); });
      }
    });

    if (nodes.hasOwnProperty(node.uid)) {
      lenientAssert(false,
        'IntegrityViolation: a node with the UID "' + node.uid + '" already exists.' +
        '\nPast definition: ' + dumpNodeFilePath(nodes[node.uid]) +
        '\nThis definition: ' + dumpNodeFilePath(node)
      );
    }

    nodes[node.uid] = node;

    if (node.documents) { // Namespace | Document
      node.documents.forEach(add);
    }

    if (node.entities) { // Document
      node.entities.forEach(add);
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

Corpus.attachNode = function(key, parentNode, node) {
  parentNode[key].push(node);

  node.parentNode = parentNode;

  return node;
};

function UID(sourceNode) {
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
  } while ((node = node.parentNode));

  return fragments.join('');
}

function flattenNodeAndChildren(node) {
  var clone = flattenNode(assign({}, node));

  if (node.documents) {
    clone.documents = node.documents.map(getUID);
  }

  if (node.entities) {
    clone.entities = node.entities.map(getUID);
  }

  return clone;
}

function flattenNode(node) {
  if (node.parentNode) {
    return assign({}, node, { parentNode: node.parentNode.uid });
  }
  else {
    return node;
  }
}

function getUID(node) {
  return node.uid;
}

function hasValidNamespaceId(node) {
  return node.id && node.id[0] !== '/' && node.id[0] !== '.';
}

module.exports = Corpus;
module.exports.dumpNodeFilePath = dumpNodeFilePath;