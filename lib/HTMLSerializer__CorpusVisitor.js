module.exports = {
  Namespace: function(node) {
    node.meta.href = NodeURI(node);
  },

  Document: function(node) {
    node.meta.href = NodeURI(node);
  },

  DocumentEntity: function(node) {
    node.meta.href = NodeURI(node);
  }
};

function NodeURI(node) {
  if (node.meta.hasOwnProperty('href')) {
    return node.meta.href;
  }
  else if (node.type === 'DocumentEntity') {
    // TODO: use FQN
    return NodeURI(node.parentNode) + '#' + encodeURI(node.uid);
  }
  else if (node.type === 'Document') {
    return NodeURI(node.parentNode) + '/' + encodeURIComponent(node.id)
  }
  else if (node.type === 'Namespace') {
    return NodeURI(node.parentNode) + encodeURIComponent(node.id);
  }
  else if (node.type === 'Corpus') {
    return '/';
  }
}