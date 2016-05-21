var CODE_BLOCK_PADDING = 4;
var RE_MATCH_INDENT = /(?:^|\n)([ \t]*)[^\s]/;

/**
 * Removes excess indentation from string of code.
 *
 * Courtesy of dox
 *
 * @param {String} str
 * @return {String}
 */
module.exports = function neutralizeWhitespace(src) {
  var indent = src.match(RE_MATCH_INDENT);
  if (indent && indent[1].length !== CODE_BLOCK_PADDING) {
    return src.replace(new RegExp('(^|\n)' + indent[1], 'g'), '$1');
  }
  else {
    return src;
  }
};
