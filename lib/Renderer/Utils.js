var marked = require('marked');
var _ = require('lodash');

var markedOptions = Object.freeze({
  tables: false,
  smartLists: false,
  sanitize: false,
  breaks: false,
  linkify: false
});

/**
 * Strip HTML from a string and get some plain text.
 *
 * @param  {String} html
 *         A string containing HTML entities.
 *
 * @return {String}
 *         The string without any HTML entities.
 */
function sanitize(html) {
  return _.escape(html);
}

/**
 * Convert a block of Markdown to plain-text.
 *
 * @param {String} markdown
 *
 * @return {String}
 *         The plain-text (no HTML inside of it) string.
 */
function renderText(markdown) {
  return sanitize(marked(markdown, markedOptions));
}

/**
 * Convert a markdown heading string to URL-friendly plain-text string.
 *
 * @param {String} str
 *        Only the first line of the string will be processed.
 *
 * @param {Boolean} [isMarkdown=true]
 *        If false, no implicit rendering to text is done. Pass this if you
 *        already called [.escapeText]() on your string or you know it contains
 *        no markdown (or HTML).
 *
 * @return {String}
 */
function normalizeHeading(str) {
  return str.split('\n')[0]
    .trim()
    .replace(/\W+/g, '-')
    .replace(/^[\-]+|[\-]+$/g, '') // leading and trailing -
    .toLowerCase()
  ;
}

exports.sanitize = sanitize;
exports.renderText = renderText;
exports.normalizeHeading = normalizeHeading;