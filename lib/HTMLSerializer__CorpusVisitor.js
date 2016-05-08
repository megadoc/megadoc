module.exports = function(config) {
  var extension = config.emittedFileExtension || '';
  var RE = extension.length > 0 && new RegExp(extension + '$');
  var suffix = config.useHashLocation ? '' : extension;

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
        return ParentNodeURI(node.parentNode) + '/' + encodeURIComponent(node.id);
      }
      else {
        return NodeURI(node.parentNode) + '#' + NodeAnchor(node);
      }
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
    if (config.useHashLocation) {
      return NodeURI(node);
    }

    return NodeURI(node).replace(RE, '');
  }

  function NodeAnchor(node) {
    if (config.useHashLocation) {
      var href = NodeURI(node);

      if (href) {
        return href;
      }
    }
    else if (node.type !== 'Corpus') {
      return encodeURIComponent(node.uid.replace(/[\/\s#]+/g, '-'));
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
