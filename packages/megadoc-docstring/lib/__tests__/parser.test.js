var subject = require('../parser');
var { assert, multiline } = require('megadoc-test-utils');

describe('parser', function() {
  describe('#parseComment', function() {
    it('parses a free-text description', function() {
      var docstring = multiline(function() {
        // hello
      });

      var comment = subject.parseComment(docstring);

      assert.ok(comment);
      assert.equal(comment.description, 'hello');
    });

    it('parses a tag', function() {
      var docstring = multiline(function() {
        // @module
      });

      var comment = subject.parseComment(docstring);

      assert.ok(comment);
      assert.equal(comment.tags.length, 1);
    });
  });

  describe('#parseTag', function() {
    it('parses the tag type', function() {
      var docstring = multiline(function() {
        // @module
      });

      var tag = subject.parseTag(docstring.trim());

      assert.ok(tag);
      assert.equal(tag.type, 'module')
    });
  });

  describe('#parseTagTypes', function() {
    it('works with "{string}"', function() {
      var docstring = multiline(function() {
        // {string}
      }).trim();

      var types = subject.parseTagTypes(docstring);

      assert.ok(types);
      assert.equal(types.length, 1);
      assert.equal(types[0], 'string');
    });

    it('works with "{string|foo}"', function() {
      var docstring = multiline(function() {
        // {string|foo}
      }).trim();

      var types = subject.parseTagTypes(docstring);

      assert.ok(types);
      assert.equal(types.length, 2);
      assert.equal(types[0], 'string');
      assert.equal(types[1], 'foo');
    });

    it('"{string[]}" => "Array.<string>"', function() {
      var docstring = multiline(function() {
        // {string[]}
      }).trim();

      var types = subject.parseTagTypes(docstring);

      assert.ok(types);
      assert.equal(types.length, 1);
      assert.equal(types[0], 'Array.<string>');
    });
  });
});