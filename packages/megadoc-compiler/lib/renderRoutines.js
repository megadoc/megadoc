const CompositeValue = require('./CompositeValue');

exports.markdown = function markdown(value) {
  return CompositeValue.create('CONVER_MARKDOWN_TO_HTML', value);
};

// TODO: is it possible to stop accepting custom contextNodes?
exports.linkify = function linkify(params) {
  return CompositeValue.create('LINKIFY_STRING', {
    text: params.text,
    contextNodeId: params.contextNode && params.contextNode.id
  });
};