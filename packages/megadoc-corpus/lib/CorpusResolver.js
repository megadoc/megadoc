var assert = require('assert');
var path = require('path')
var RE_MATCH_ENTITY_IN_FILEPATH = /\.\w+(\b.+)$/;

module.exports = resolve;

function resolve(anchor, options, _visited) {
  assert(anchor && typeof anchor.text === 'string',
    "ArgumentError: resolve request requires a 'text' term to resolve.");

  assert(anchor && anchor.contextNode && typeof anchor.contextNode === 'object',
    "ArgumentError: resolve request requires a contextNode to resolve from.");

  var targetNode;
  var term = anchor.text;
  var contextNode = anchor.contextNode;
  var parentNode = contextNode.parentNode;
  var visited = _visited || {};
  var trace = options && options.trace ? console.log.bind(console) : Function.prototype;

  trace("Context:", contextNode.uid);
  trace("Term:", term);

  if (term.match(/^(\.\.?\/)+/)) {
    return resolveByFilePath(anchor);
  }

  // descend first
  if (!isLeaf(contextNode)) {
    targetNode = searchInBranch(contextNode);
  }

  // go up the tree one level, unless we're at the Corpus level
  if (!targetNode && parentNode) {
    trace("Found nothing at this level, looking for a document in my ancestor...");
    trace(Array(80).join('-'))

    return resolve({ contextNode: parentNode, text: term }, options, visited);
  }

  return targetNode;

  function searchInBranch(node) {
    var result;
    trace("Searching '%s'...", node.uid)

    if (hasVisited(node)) {
      trace("- Skipping '%s' - already seen before!", node.uid);
      return;
    }

    if (node.entities) { // Document
      node.entities.some(visitLeafNode);
    }

    if (!result && node.documents) { // Namespace | Document
      node.documents.some(visitBranchNode);
    }

    if (!result && node.namespaces) { // Corpus
      node.namespaces.some(visitBranchNode);
    }

    function visitBranchNode(childNode) {
      if (hasVisited(childNode)) {
        trace("- Skipping '%s' - already seen before!", childNode.uid);
        return;
      }

      trace("- Checking '%s'", childNode.uid);

      if (matches(childNode)) {
        result = childNode;
      }
      else {
        result = searchInBranch(childNode);
      }

      markVisited(childNode);

      return !!result;
    }

    function visitLeafNode(childNode) {
      if (hasVisited(childNode)) {
        trace("- Skipping '%s' - already seen before!", childNode.uid);
        return;
      }

      trace("- Checking entity '%s'...", childNode.uid);

      markVisited(childNode);

      if (matches(childNode, childNode.parentNode !== contextNode)) {
        result = childNode;
      }

      return !!result;
    }

    return result;
  }

  function matches(node, dontLookForPrivateIndices) {
    if (dontLookForPrivateIndices) {
      return node.uid === term || node.indices[term] > 0;
    }
    else {
      return node.uid === term || term in node.indices;
    }
  }

  function markVisited(node) {
    visited[node.uid] = true;
  }

  function hasVisited(node) {
    return node.uid in visited;
  }
};

function isLeaf(node) {
  return node.type === 'DocumentEntity';
}


function resolveByFilePath(anchor) {
  var filePath = anchor.text;
  var contextNode = anchor.contextNode;
  var targetPath;
  var entityId;

  if (path.extname(filePath).match(RE_MATCH_ENTITY_IN_FILEPATH)) {
    entityId = RegExp.$1;
    filePath = filePath.slice(0, -1 * entityId.length);
  }

  targetPath = path.join(path.dirname(contextNode.filePath), filePath);

  var node = resolve({ text: targetPath, contextNode: anchor.contextNode });

  if (entityId && node) {
    return resolve({
      text: node.uid + entityId,
      contextNode: node
    });
  }
  else {
    return node;
  }
}