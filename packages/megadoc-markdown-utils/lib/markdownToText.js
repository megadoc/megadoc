const marked = require('marked');
const htmlToText = require('./htmlToText');
const markdownToTextOptions = ({
  tables: false,
  smartLists: false,
  sanitize: false,
  breaks: false,
  linkify: false
});

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
  return htmlToText(marked(md, markdownToTextOptions));
}

module.exports = markdownToText;
