var resolveLink = require('./CorpusResolver');
var buildIndices = require('./CorpusIndexer');
var b = require('./CorpusTypes').builders;
var assert = require('assert');

/**
 * The Corpus public API.
 */
function Corpus() {
  var exports = {};
  var nodes = {};
  var corpusNode = b.corpus({
    namespaces: []
  });

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
   * @param {T.Node} anchor.contextNode
   *        The UID of the contextNode we're resolving from.
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

    return resolveLink(anchor);
  };

  /**
   * @private
   */
  exports.dumpPaths = function() {
    return Object.keys(nodes);
  };

  exports.add = add;

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
      node.symbol = node.symbol || '/';
    }
    else {
      assert(node.parentNode,
        "IntegrityViolation: expected node to reference a parentNode."
      );
    }

    node.uid = UID(node);
    node.indices = buildIndices(node);

    nodes[node.uid] = node;

    if (node.documents) { // Namespace | Document
      node.documents.forEach(add);
    }

    if (node.entities) { // Document
      node.entities.forEach(add);
    }
  }

  return exports;
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

module.exports = Corpus;

