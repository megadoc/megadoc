const CompositeValue = require('./render/CompositeValue');
const invariant = require('invariant');

exports.markdown = function markdown(params) {
  invariant(typeof params.text === 'string' || CompositeValue.isCompositeValue(params.text),
    `"text" must be specified for markdown!`
  );

  invariant(!!params.contextNode,
    `"contextNode" must be specified for markdown!`
  );

  return CompositeValue.create('CONVERT_MARKDOWN_TO_HTML', params);
};

// TODO: is it possible to stop accepting custom contextNodes?
// TODO: use contextNodeId instead of actual node
exports.linkify = function linkify(params) {
  const text = typeof params === 'string' ? params : params.text;

  invariant(!!params.contextNode,
    "contextNode must be specified for a link!"
  );

  return CompositeValue.create('LINKIFY_STRING', {
    text: text,
    contextNode: params.contextNode
  });
};

// TODO: use contextNodeId instead of actual node
exports.linkifyFragment = function linkifyFragment(params) {
  invariant(!!params.contextNode,
    "contextNode must be specified for a link!"
  );

  return CompositeValue.create('LINKIFY_FRAGMENT', {
    text: params.text,
    format: params.format,
    injectors: params.injectors,
    contextNode: params.contextNode
  });
};

exports.resolveUID = function resolveUID(params) {
  invariant(!!params.contextNode,
    "contextNode must be specified for a link!"
  );

  return CompositeValue.create('RESOLVE_UID', {
    text: params.text,
    contextNode: params.contextNode
  });
};

exports.escapeHTML = function escapeHTML(params) {
  return CompositeValue.create('ESCAPE_HTML', {
    text: params.text
  });
};
