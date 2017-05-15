const CompositeValue = require('./render/CompositeValue');

exports.markdown = function markdown(value) {
  return CompositeValue.create('CONVERT_MARKDOWN_TO_HTML', value);
};

// TODO: is it possible to stop accepting custom contextNodes?
// TODO: use contextNodeId instead of actual node
exports.linkify = function linkify(params) {
  const text = typeof params === 'string' ? params : params.text;

  return CompositeValue.create('LINKIFY_STRING', {
    text: text,
    contextNode: params.contextNode
  });
};

// TODO: use contextNodeId instead of actual node
exports.linkifyFragment = function linkifyFragment(params) {
  return CompositeValue.create('LINKIFY_FRAGMENT', {
    text: params.text,
    format: params.format,
    strict: params.strict,
    contextNode: params.contextNode
  });
};