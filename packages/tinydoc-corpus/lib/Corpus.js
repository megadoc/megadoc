var assert = require('assert');
var resolveLink = require('./CorpusResolver');
var buildIndices = require('./CorpusIndexer');
var Types = require('./CorpusTypes');
var assign = require('object-assign');
var b = Types.builders;

/**
 * The Corpus public API.
 */
function Corpus() {
  var exports = {};
  var nodes = {};
  var corpusNode = b.corpus({
    meta: {},
    namespaces: []
  });

  var visitors = {};

  exports.visit = function(visitor) {
    Object.keys(visitor).forEach(function(typeName) {
      assert(Types.isTypeKnown(typeName),
        "ArgumentError: a visitor was defined for an unknown node type '" + typeName + "'."
      );

      visitors[typeName] = visitors[typeName] || [];
      visitors[typeName].push(visitor[typeName]);
    });
  };

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

  exports.getRootNode = function() {
    return corpusNode;
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

  exports.add = add;

  exports.toJSON = function() {
    return Object.keys(nodes).reduce(function(map, uid) {
      map[uid] = flattenNodeAndChildren(nodes[uid]);
      return map;
    }, {});
  };

  /**
   * @lends Corpus
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
  function add(node) {
    if (node.type === 'Namespace') {
      assert(corpusNode.namespaces.map(function(x) { return x.id; }).indexOf(node.id) === -1,
        "IntegrityViolation: a namespace with the id '" + node.id + "' already exists."
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

    node.uid = UID(node);
    node.indices = buildIndices(node);

    nodes[node.uid] = node;

    Types.getTypeChain(node.type).forEach(function(typeName) {
      if (typeName in visitors) {
        visitors[typeName].forEach(function(fn) { fn(node); });
      }
    });

    if (node.documents) { // Namespace | Document
      node.documents.forEach(add);
    }

    if (node.entities) { // Document
      node.entities.forEach(add);
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


module.exports = Corpus;

