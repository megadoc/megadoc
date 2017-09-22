const assert = require('assert');
const R = require('ramda')
const resolveLink = require('./CorpusResolver');
const CorpusIndexer = require('./CorpusIndexer');
const Types = require('./CorpusTypes');
const assign = require('object-assign');
const dumpNodeFilePath = require('./CorpusUtils').dumpNodeFilePath;
const { NoConflicts, NoNamespaceConflicts } = require('./lintingRules');

const b = Types.builders;

/**
 * @preserveOrder
 *
 * The Corpus public API.
 */
function Corpus({ assetRoot, strict = true, alias: aliases = {} }, { linter }) {
  const exports = {};
  const nodes = {};
  const paths = {};
  const nodeList = [];
  const corpusNode = b.corpus({
    meta: {},
    namespaces: [],
    indexFields: [ '$path', '$filePath' ],
  });

  const buildIndices = CorpusIndexer(exports, { assetRoot });

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
    else if (object.parentNodeUID) {
      return nodes[object.parentNodeUID];
    }

    return null;
  };

  exports.resolve = resolve;

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
   * Serialize the Corpus to a flat JSON map with no circular dependencies.
   *
   * @return {Object}
   *         An object that can be safely serialized to disk.
   */
  exports.toJSON = function() {
    return nodeList
      .map(R.partial(flattenNodeAndChildren, [ exports ]))
      .map(node => Object.assign(node, {
        filePath: linter.getRelativeFilePath(node.filePath)
      }))
    ;
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
  function resolve(anchor) {
    if (nodes.hasOwnProperty(anchor.text)) {
      return nodes[anchor.text];
    }
    else if (paths.hasOwnProperty(anchor.text)) {
      return paths[anchor.text];
    }

    const withContextNode = Object.assign({}, anchor, {
      contextNode: anchor.contextNode || corpusNode
    });

    return (
      resolveLink(withContextNode, { getParentOf: exports.getParentOf }) ||
      resolveAliasedLink(withContextNode)
    );
  }

  /** @private */
  function resolveAliasedLink(anchor) {
    if (aliases.hasOwnProperty(anchor.text) && aliases[anchor.text] !== anchor.text) {
      const aliased = exports.resolve(R.merge(anchor, { text: aliases[anchor.text] }))

      if (aliased) {
        return {
          node: aliased,
          text: anchor.text
        }
      }
    }
  }

  function add(node, parentNode) {
    if (node.type === 'Namespace') {
      const hasConflict = corpusNode.namespaces.map(R.prop('id')).indexOf(node.id) > -1;

      if (hasConflict) {
        linter.logRuleEntry({
          rule: NoNamespaceConflicts,
          params: { node },
          loc: linter.locationForNode(node),
        })

        return;
      }

      if (!hasValidNamespaceId(node)) {
        linter.logError({
          message: `Namespace id may not start with "/" or "."`,
          loc: linter.locationForNode(node),
        })

        return;
      }

      corpusNode.namespaces.push(node);
    }
    else if (parentNode) {
      node.parentNodeUID = parentNode.uid;
    }
    else {
      linter.logError({
        message: `Unable to resolve parent document`,
        loc: linter.locationForNode(node)
      })

      return;
    }

    node.path = generateNodePath(exports, node);
    node.indices = Object.assign({},
      buildIndices(node, { getParentOf: exports.getParentOf }),
      node.indices
    );

    if (nodes.hasOwnProperty(node.uid)) {
      linter.logError({
        message: `Node has been seen before, this shouldn't happen...`,
        loc: linter.locationForNode(node)
      });
    }

    if (paths.hasOwnProperty(node.path)) {
      linter.logRuleEntry({
        rule: NoConflicts,
        params: {
          path: node.path,
          previousLocation: linter.locationForNodeAsString(paths[node.path])
        },
        loc: linter.locationForNode(node)
      })

      if (strict) {
        return;
      }
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
  var flatNode = flattenNode(corpus, node);

  if (node.documents) {
    flatNode.documents = node.documents.map(getUID);
  }

  if (node.entities) {
    flatNode.entities = node.entities.map(getUID);
  }

  return flatNode;
}

function flattenNode(corpus, node) {
  if (node.parentNodeUID) {
    return assign(node.toJSON(), { parentNodeUID: getUID(corpus.getParentOf(node)) });
  }
  else {
    return node.toJSON();
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