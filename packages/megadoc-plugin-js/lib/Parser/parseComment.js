var neutralizeWhitespace = require('./Docstring/Tag/neutralizeWhitespace');
var parseComment = require('comment-parser/parser.js');
var PARSERS = parseComment.PARSERS;

function parseDescription(str, data) {
  if (data.errors && data.errors.length) { return null; }

  if (str.match(/\S/)) {
    return {
      source: str,
      data: {
        description: neutralizeWhitespace(str).replace(/^\n+|\n+$/g, '')
      }
    };
  }
  else {
    return null;
  }
};

module.exports = function(str) {
  return parseComment(str, {
    trim: false,
    parsers: [
      PARSERS.parse_tag,
      PARSERS.parse_type,
      PARSERS.parse_name,
      parseDescription
    ]
  });
};