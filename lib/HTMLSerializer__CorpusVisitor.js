module.exports = function(config) {
  return {
    Namespace: decorateNode,
    Document: decorateNode,
    DocumentEntity: decorateNode,
  };

  function decorateNode(node) {
    node.meta.href = NodeURI(node);
    node.meta.anchor = NodeAnchor(node);
  }

  function NodeURI(node) {
    if (shouldIgnore(node)) {
      return node.meta.href;
    }

    if (node.type === 'DocumentEntity') {
      if (config.useHashLocation) {
        return NodeURI(node.parentNode) + '/' + encodeURIComponent(node.id);
      }
      else {
        return NodeURI(node.parentNode) + '#' + encodeURI(node.uid);
      }
    }
    else if (node.type === 'Document') {
      return NodeURI(node.parentNode) + '/' + encodeURIComponent(node.id)
    }
    else if (node.type === 'Namespace') {
      return NodeURI(node.parentNode) + encodeURIComponent(node.id);
    }
    else if (node.type === 'Corpus') {
      // return config.useHashLocation ? '#/' : '/';
      return  '/';
    }
  }

  function NodeAnchor(node) {
    if (config.useHashLocation) {
      var href = NodeURI(node);

      if (href) {
        return href.replace(/^#/, '');
      }
    }
    else if (node.type !== 'Corpus') {
      return encodeURIComponent(node.uid);
    }
    else {
      return null;
    }
  }

  function shouldIgnore(node) {
    return node.meta.hasOwnProperty('href') && (
      node.meta.href === null ||
      node.meta.href[0] === '/'
    );
  }
};
