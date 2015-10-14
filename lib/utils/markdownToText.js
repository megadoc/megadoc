var marked = require('marked');
var htmlToText = require('./htmlToText');

var markedOptions = Object.freeze({
  tables: false,
  smartLists: false,
  sanitize: false,
  breaks: false,
  linkify: false
});

/**
 * Convert a block of Markdown to plain-text.
 *
 * @param {String} markdown
 *
 * @return {String}
 *         The plain-text (no HTML inside of it) string.
 */
module.exports = function(md) {
  return htmlToText(marked(md, markedOptions));
};