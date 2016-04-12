var neutralizeWhitespace = require('../neutralizeWhitespace');
var assert = require('chai').assert;
var multiline = require('multiline-slash');

var parse = function(strGenerator) {
  return neutralizeWhitespace(multiline(strGenerator));
};

describe('CJS::Parser::Docstring::Tag::neutralizeWhitespace', function() {
  it('strips leading whitespace from description', function() {
    var string = parse(function() {;
      //          This
      //          is
      //          a
      //          multiline
      //          description.
    });

    assert.equal(
      string
        // this silly hack is to work around istanbul's instrumentor /
        // multiline-slash where when NOT instrumenting, we'll have a leading
        // newline
        .replace(/^\n{0,1}/, '')
      ,
      'This\nis\na\nmultiline\ndescription.\n'
    );
  });
});