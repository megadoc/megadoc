/**
 * @module
 *
 * Convert a markdown heading string to URL-friendly plain-text string.
 *
 * @param {String} str
 *        Only the first line of the string will be processed.
 *
 * @param {Boolean} [isMarkdown=true]
 *        If false, no implicit rendering to text is done. Pass this if you
 *        already called [markdownToText]() on your string or you know it contains
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

module.exports = normalizeHeading;