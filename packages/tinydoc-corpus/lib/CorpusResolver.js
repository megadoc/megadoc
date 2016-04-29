module.exports = function resolve(anchor, options, _visited) {
  var targetNode;
  var term = anchor.text;
  var contextNode = anchor.contextNode;
  var parentNode = contextNode.parentNode;
  var visited = _visited || {};
  var trace = options && options.trace ? console.log.bind(console) : Function.prototype;

  trace("Context:", contextNode.uid);
  trace("Term:", term);

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
      return node.uid === term || node.indices[term] > 1;
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

  return targetNode;
};

function isLeaf(node) {
  return node.type === 'DocumentEntity';
}

