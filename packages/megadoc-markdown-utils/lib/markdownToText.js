const marked = require('marked');
const PlainTextRenderer = require('marked-plaintext')

/**
 * @module
 *
 * Convert a block of Markdown to plain-text.
 *
 * @param {String} markdown
 *
 * @return {String}
 *         The plain-text (no HTML inside of it) string.
 */
function markdownToText(md) {
  return marked(md, { renderer: new PlainTextRenderer })
}

module.exports = markdownToText;
