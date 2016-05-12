module.exports = function(config) {
  var extension = config.emittedFileExtension || '';
  var RE = extension.length > 0 && new RegExp(extension + '$');
  var suffix = extension;
  var layoutConfig = config.layoutOptions || {};
  var rewriteMap = layoutConfig.rewrite || {};

  return {
    Namespace: decorateNode,
    Document: decorateNode,
    DocumentEntity: decorateNode,
  };

  function decorateNode(node) {
    node.meta.href = rewriteMap[node.uid] || NodeURI(node);
    node.meta.anchor = NodeAnchor(node);
  }

  function NodeURI(node) {
    if (shouldIgnore(node)) {
      return node.meta.href;
    }

    if (node.type === 'DocumentEntity') {
      return NodeURI(node.parentNode) + '#' + NodeAnchor(node);
    }
    else if (node.type === 'Document') {
      return ParentNodeURI(node.parentNode) + '/' + encodeURIComponent(node.id) + suffix;
    }
    else if (node.type === 'Namespace') {
      return ParentNodeURI(node.parentNode) + encodeURIComponent(node.id) + suffix;
    }
    else if (node.type === 'Corpus') {
      return  '/';
    }
  }

  function ParentNodeURI(node) {
    return NodeURI(node).replace(RE, '');
  }

  function NodeAnchor(node) {
    if (node.meta.hasOwnProperty('anchor')) {
      return node.meta.anchor;
    }
    else if (node.type !== 'Corpus') {
      return encodeURIComponent(node.uid.replace(/[\/\s]+/g, '-'));
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
