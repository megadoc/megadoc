module.exports = function buildIndices(node) {
  if (node.type === 'Namespace') {
    return {};
  }

  var indices = {};
  var ancestors = [];
  var anchorNode = node;

  do {
    if (anchorNode.type === 'Namespace') {
      break;
    }

    ancestors.unshift(anchorNode);

    indices[ancestors.map(identifyNode).join('')] = ancestors.length;
  } while ((anchorNode = anchorNode.parentNode));

  return indices;

  function identifyNode(x, i) {
    if (i > 0) {
      return (ancestors[i-1].symbol || '') + x.id;
    }
    else {
      return x.id;
    }
  }
}
