var parseComment = require('comment-parser/parser.js');
var neutralizeWhitespace = require('megadoc-docstring/lib/utils/neutralizeWhitespace');
var RE_TRIM_SURROUNDING_NEWLINES = /^\n+|\n+$/g;
var RE_HAS_STUFF = /\S/;
var parserOptions = {
  trim: false,
  parsers: [
    parseComment.PARSERS.parse_tag,
    parseComment.PARSERS.parse_type,
    parseComment.PARSERS.parse_name,
    parseDescription
  ]
};

module.exports = function(str) {
  return parseComment(str, parserOptions);
};

function parseDescription(str, data) {
  if (data.errors && data.errors.length) { return null; }

  if (str.match(RE_HAS_STUFF)) {
    return {
      source: str,
      data: {
        description: neutralizeWhitespace(str).replace(RE_TRIM_SURROUNDING_NEWLINES, '')
      }
    };
  }
  else {
    return null;
  }
};
