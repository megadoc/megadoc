var compose = require('lodash').compose;

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
    var href;

    // allow rewrite by filepath
    if (node.filePath && rewriteMap[node.filePath]) {
      href = rewriteMap[node.filePath];
    }
    // allow rewrite by UID
    else if (rewriteMap[node.uid]) {
      href = rewriteMap[node.uid];
    }
    else {
      href = g.NodeURI(node);

      // allow rewrite by URL
      if (rewriteMap[href]) {
        href = rewriteMap[href];
      }
    }

    node.meta.href = href;
    node.meta.anchor = g.NodeAnchor(node);
  }
};

function FileBasedURIGenerator(config) {
  var extension = config.emittedFileExtension || '';
  var RE = extension.length > 0 && new RegExp(extension + '$');

  return {
    NodeURI: compose(ensureHasOneLeadingSlash, NodeURI),
    NodeAnchor: NodeAnchor
  };

  function NodeURI(node) {
    if (shouldIgnore(node)) {
      return ensureHasExtension(node.meta.href);
    }

    if (node.type === 'DocumentEntity') {
      return NodeURI(node.parentNode) + '#' + NodeAnchor(node);
    }
    else if (node.type === 'Document') {
      return ParentNodeURI(node.parentNode) + '/' + encodeURI(node.id) + extension;
    }
    else if (node.type === 'Namespace') {
      return '/' + encodeURI(node.id) + extension;
    }
    else if (node.type === 'Corpus') {
      return  null;
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
      return encodeURI(node.uid.replace(/[\/\s]+/g, '-'));
    }
    else {
      return null;
    }
  }

  function ensureHasExtension(s) {
    if (s) {
      return s.match(RE) ? s : s + extension;
    }
  }
}

function HashBasedURIGenerator(/*config*/) {
  return {
    NodeURI: compose(ensureHasOneLeadingSlash, NodeURI),
    NodeAnchor: NodeAnchor
  };

  function NodeURI(node) {
    if (shouldIgnore(node)) {
      return ensureLeadingHash(node.meta.href);
    }

    if (node.type === 'DocumentEntity') {
      return NodeURI(node.parentNode) + '/' + encodeURI(node.id);
    }
    else if (node.type === 'Document') {
      return NodeURI(node.parentNode) + '/' + encodeURI(node.id);
    }
    else if (node.type === 'Namespace') {
      return '#/' + encodeURI(node.id);
    }
    else if (node.type === 'Corpus') {
      return null;
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

// because people could add a leading slash, or forget to add it - we should
// support either notation really
function ensureHasOneLeadingSlash(href) {
  if (href) {
    return href.replace(/^(\#?)\/+/, '$1/');
  }
}