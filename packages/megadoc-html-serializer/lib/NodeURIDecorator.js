const compose = require('lodash').compose;
const invariant = require('invariant');
const { dumpNodeFilePath } = require('megadoc-corpus');

module.exports = function NodeURIDecorator(config) {
  var g = config.layoutOptions.singlePageMode ?
    HashBasedURIGenerator(config) :
    FileBasedURIGenerator(config)
  ;

  var layoutConfig = config.layoutOptions || {};
  var redirectMap = config.redirect || {};
  var rewriteMap = layoutConfig.rewrite || {};

  return {
    Namespace: decorateNode,
    Document: decorateNode,
    DocumentEntity: decorateNode,
  };

  // This will decorate a node with the following meta properties:
  //
  // @property {String} meta.href
  //
  // A fully-qualified URL to the document. This will include the file extension
  // if applicable (multi-page-mode) and the hash segment if it's an entity.
  //
  // @property {String} meta.anchor
  //
  // A local URL (hash segment) that can be used to "jump" (anchor) to the
  // document or the entity. In SPM (HashLocation) this is unused.
  //
  // @property {Boolean} meta.hrefRewritten
  //
  // Whether the href was not generated and instead an explicit rewritten URL
  // was used. We need this so that we can force the generation of the .html
  // file over any existing one (in case the rewrite shadows another document)
  // and in the UI to accommodate for links to rewritten URLs.
  //
  function decorateNode(node) {
    var href;

    // allow rewrite by filepath
    if (node.filePath && rewriteMap.hasOwnProperty(node.filePath)) {
      href = rewriteMap[node.filePath];
      node.meta.hrefRewritten = true;
    }
    // allow rewrite by UID
    else if (rewriteMap.hasOwnProperty(node.uid)) {
      href = rewriteMap[node.uid];
      node.meta.hrefRewritten = true;
    }
    else {
      href = g.NodeURI(node);

      // allow rewrite by URL
      if (rewriteMap.hasOwnProperty(href)) {
        href = rewriteMap[href];
        node.meta.hrefRewritten = true;
      }
    }

    // allow redirect by filepath
    if (node.filePath && redirectMap.hasOwnProperty(node.filePath)) {
      node.meta.redirect = redirectMap[node.filePath];
    }
    // allow redirect by UID
    else if (redirectMap.hasOwnProperty(node.uid)) {
      node.meta.redirect = redirectMap[node.uid];
    }
    // allow redirect by URL
    else if (redirectMap.hasOwnProperty(href)) {
      node.meta.redirect = redirectMap[href];
    }

    node.meta.href = href;
    node.meta.anchor = g.NodeAnchor(node);

    // we replace the hashtag for single-page mode URLs, otherwise ensure there
    // is no leading slash in the filepath! we do not want to write to /
    node.meta.htmlFilePath = node.type === 'DocumentEntity' ?
      null :
      node.meta.href.replace(/^(\#?)\/+/, '')
    ;

    if (process.env.VERBOSE) {
      console.log('Node "%s" href: "%s"', node.uid, node.meta.href)
    }
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
      if (!node.parentNode) {
        invariant(false, `Node has no parent! ${dumpNodeFilePath(node)}`);
      }

      return NodeURI(node.parentNode) + '#' + NodeAnchor(node);
    }
    else if (node.type === 'Document') {
      if (!node.parentNode) {
        invariant(false, `Node has no parent! ${dumpNodeFilePath(node)}`);
      }

      return (
        ParentNodeURI(node.parentNode) + '/' + encodeURI(node.id) +
        // What's happening here merits some explanation: documents that nest
        // other documents beneath them should be placed inside
        // `/path/to/document/index.html` instead of `/path/to/document.html`
        // and that is because there may be a sibling document (that is, at
        // this level in the tree) that has the same name INCLUDING the extension
        // (like `tinymce` and `tinymce.html`) in which case we'll have conflicts
        // since both documents will point to /path/to/tinymce.html
        //
        // With this tuning, for a document structure that looks like this:
        //
        //     [
        //       { type: 'Document', id: 'tinymce', documents: [{ id: 'A' }] },
        //       { type: 'Document', id: 'tinymce.html', documents: [{ id: 'A' }]
        //     ]
        //
        // We'll have:
        //
        //     /.../tinymce/index.html
        //     /.../tinymce/A.html
        //     /.../tinymce.html/index.html
        //     /.../tinymce.html/A.html
        //
        // Et voila! No conflicts.
        (node.documents && node.documents.length ? '/index' : '') +
        extension
      );
    }
    else if (node.type === 'Namespace') {
      return '/' + encodeURI(node.id) + '/index' + extension;
    }
    else if (node.type === 'Corpus') {
      return  null;
    }
  }

  function ParentNodeURI(node) {
    return NodeURI(node).replace(RE, '').replace(/\/index$/, '');
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

    if (node.type === 'Corpus') {
      return null;
    }

    return '#/' + encodeURI(node.uid);

    // if (node.type === 'DocumentEntity') {
    //   return NodeURI(node.parentNode) + '/' + encodeURI(node.id);
    // }
    // else if (node.type === 'Document') {
    //   return NodeURI(node.parentNode) + '/' + encodeURI(node.id);
    // }
    // else if (node.type === 'Namespace') {
    //   return '#/' + encodeURI(node.id);
    // }
    // else if (node.type === 'Corpus') {
    //   return null;
    // }
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