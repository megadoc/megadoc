const LinkResolver = require('core/LinkResolver');
const { normalizeHeading, renderText } = require('components/MarkdownText');

module.exports = function(markdown, normalize = true) {
  var text = renderText(LinkResolver.linkify(markdown));

  if (normalize) {
    text = normalizeHeading(text);
  }

  return text;
};