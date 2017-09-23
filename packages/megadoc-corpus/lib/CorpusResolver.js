var assert = require('assert');
var path = require('path')
var RE_MATCH_ENTITY_IN_FILEPATH = /\.\w+(\b.+)$/;

module.exports = resolve;

function resolve(anchor, options = {}, _state) {
  const { getParentOf } = options;

  assert(anchor && typeof anchor.text === 'string',
    "ArgumentError: resolve request requires a 'text' term to resolve.");

  assert(anchor && anchor.contextNode && typeof anchor.contextNode === 'object',
    "ArgumentError: resolve request requires a contextNode to resolve from.");

  var index;
  var term = anchor.text;
  var contextNode = anchor.contextNode;
  var parentNode = getParentOf(contextNode);

  var state = _state || {
    visited: {},
    // friend nodes are ones we can access by their private indices, which
    // basically are our direct siblings if we're resolving from a non-leaf
    // node, otherwise they'd be the parent and the grandparent.
    //
    // | -- NS1
    // |    |-- X
    // |    |-- Y
    // |    |-- Core
    // |        |-- X         <- friends: [Core], can access Core.Y using "Y"
    // |        |   |-- @id   <- friends: [X, Core], can access Core.X#add using "#add"
    // |        |   |-- #add
    // |        |-- Y         <- friends: [Core], can access Core.X using "X"
    // |        |   |-- @id   <- friends: [Y, Core], can NOT access Core.X#add using "#add"!!!
    // |    |-- Z             <- friends: [NS1]
    friends: createListOfFriendNodes(contextNode, getParentOf)
  };

  var trace = options && options.trace ? console.log.bind(console) : Function.prototype;

  trace("Context:", contextNode.path);
  trace("Term:", term);

  if (term.match(/^(\.{1,2}\/)+/)) {
    return resolveByFilePath(anchor, options);
  }

  // descend first
  if (!isLeaf(contextNode)) {
    index = searchInBranch(contextNode, isFriend(contextNode));
  }

  // go up the tree one level, unless we're at the Corpus level
  if (!index && parentNode) {
    trace("Found nothing at this level, looking for a document in my ancestor...");
    trace(Array(80).join('-'))

    return resolve({ contextNode: parentNode, text: term, }, options, state);
  }

  return index;

  function searchInBranch(node, inFriendBranch) {
    let result;

    trace("Searching '%s' (relative? %s, %s)...", node.path, inFriendBranch, JSON.stringify(node.indices))

    if (hasVisited(node)) {
      trace("- Skipping '%s' - already seen before!", node.path);

      return null;
    }

    if (!result && node.entities) { // Document
      node.entities.some(visitLeafNode);
    }

    if (!result && node.documents) { // Namespace | Document
      node.documents.some(visitBranchNode);
    }

    if (!result && node.namespaces) { // Corpus
      node.namespaces.some(visitBranchNode);
    }

    function visitBranchNode(childNode) {
      if (!hasVisited(childNode)) {
        trace("- Checking '%s'", childNode.path);

        if (matches(term, childNode, inFriendBranch)) {
          trace("- Found '%s'!", childNode.path, term);

          result = {
            node: childNode,
            text: inFriendBranch ? getPrivateNodeIndex(childNode) : childNode.title || term,
          };
        }
        else {
          result = searchInBranch(childNode, isFriend(childNode));
        }

        markVisited(childNode);
      }

      return !!result;
    }

    function visitLeafNode(childNode) {
      if (!hasVisited(childNode)) {
        trace("- Checking entity '%s'...", childNode.path);

        markVisited(childNode);

        if (matches(term, childNode, inFriendBranch)) {
          result = {
            node: childNode,
            text: inFriendBranch ? getPrivateNodeIndex(childNode) : childNode.title || term,
          };
        }
      }

      return !!result;
    }

    return result;
  }

  function markVisited(node) {
    state.visited[node.uid] = true;
  }

  function hasVisited(node) {
    return node.uid in state.visited;
  }

  function isFriend(node) {
    return node.uid in state.friends;
  }
};

function matches(term, n, lookInPrivateIndices) {
  if (n.path === term) {
    return true;
  }
  else if (!n.indices) {
    return false;
  }
  else if (lookInPrivateIndices) {
    return term in n.indices;
  }
  else {
    return n.indices[term] > 0;
  }
}

function getPrivateNodeIndex(node) {
  return Object.keys(node.indices).filter(index => node.indices[index] === 0)[0];
}

function isLeaf(node) {
  return node.type === 'DocumentEntity';
}

function resolveByFilePath(anchor, options) {
  var filePath = anchor.text;
  var contextNode = anchor.contextNode;
  var targetPath;
  var entityId;

  if (path.extname(filePath).match(RE_MATCH_ENTITY_IN_FILEPATH)) {
    entityId = RegExp.$1;
    filePath = filePath.slice(0, -1 * entityId.length);
  }

  targetPath = ensureLeadingSlash(path.join(path.dirname(contextNode.filePath), filePath));

  const { node: targetNode } = resolve(
    { text: targetPath, contextNode: anchor.contextNode },
    options
  ) || {};

  if (targetNode && entityId) {
    return resolve({
      text: targetNode.path + entityId,
      contextNode: targetNode
    }, options);
  }
  else if (targetNode) {
    return { node: targetNode, text: targetNode.title };
  }
  else {
    return null;
  }
}

function createListOfFriendNodes(node, getParentOf) {
  const map = { [node.uid]: true };
  const parentNode = getParentOf(node);

  if (parentNode) {
    map[parentNode.uid] = true;

    const grandParentNode = getParentOf(parentNode);

    if (isLeaf(node) && grandParentNode) {
      map[grandParentNode.uid] = true;
    }
  }

  return map;
}

function ensureLeadingSlash(s) {
  return s[0] === '/' ? s : '/' + s;
}