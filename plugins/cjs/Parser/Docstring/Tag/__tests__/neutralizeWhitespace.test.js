var neutralizeWhitespace = require('../neutralizeWhitespace');
var assert = require('chai').assert;

var parse = function(strGenerator) {
  return neutralizeWhitespace(
    global.TestUtils.getInlineString(strGenerator)
  );
};

describe('CJS::Parser::Docstring::Tag::neutralizeWhitespace', function() {
  it('strips leading whitespace from description', function() {
    var string = parse(function() {
      //          This
      //          is
      //          a
      //          multiline
      //          description.
    });

    assert.equal(string, '\nThis\nis\na\nmultiline\ndescription.\n');
  });
});