module.exports = function(config) {
  var g = config.layoutOptions.singlePageMode ?
    HashBasedURIGenerator(config) :
    FileBasedURIGenerator(config)
  ;

  var layoutConfig = config.layoutOptions || {};
  var rewriteMap = layoutConfig.rewrite || {};

  return {
    Namespace: decorateNode,
    Document: decorateNode,
    DocumentEntity: decorateNode,
  };

  function decorateNode(node) {
    node.meta.href = rewriteMap[node.uid] || g.NodeURI(node);
    node.meta.anchor = g.NodeAnchor(node);
  }
};

function FileBasedURIGenerator(config) {
  var extension = config.emittedFileExtension || '';
  var RE = extension.length > 0 && new RegExp(extension + '$');
  var suffix = extension;

  return { NodeURI: NodeURI, NodeAnchor: NodeAnchor };

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
}

function HashBasedURIGenerator(/*config*/) {
  return {
    NodeURI: NodeURI,
    NodeAnchor: NodeAnchor
  };

  function NodeURI(node) {
    if (shouldIgnore(node)) {
      return ensureLeadingHash(node.meta.href);
    }

    if (node.type === 'DocumentEntity') {
      return NodeURI(node.parentNode) + '/' + encodeURIComponent(node.id);
    }
    else if (node.type === 'Document') {
      return NodeURI(node.parentNode) + '/' + encodeURIComponent(node.id);
    }
    else if (node.type === 'Namespace') {
      return NodeURI(node.parentNode) + encodeURIComponent(node.id);
    }
    else if (node.type === 'Corpus') {
      return  '#/';
    }
  }

  function NodeAnchor(node) {
    var href = NodeURI(node);

    if (href) {
      return href.replace(/^#/, '');
    }
  }

  function ensureLeadingHash(s) {
    if (s) {
      return s[0] === '#' ? s : '#' + s;
    }
  }
}

function shouldIgnore(node) {
  return node.meta.hasOwnProperty('href') && (
    node.meta.href === null ||
    (node.meta.href && node.meta.href[0] === '/')
  );
}