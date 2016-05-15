var multiline = require('multiline-slash');
var subject = require('../parser');
var assert = require('chai').assert;
var Parser = subject.Parser;

describe('Parser.FACTORIES.withName', function() {
  var parser;

  beforeEach(function() {
    parser = new Parser();
    parser.defineTag('module', Parser.FACTORIES.withName);
  });

  it('works with no name and description', function() {
    var docstring = multiline(function() {;
      // @module
    });

    var rawTag = subject.parseTag(docstring.trim());
    var tag = parser.createTag(rawTag);

    assert.equal(tag.name, '');
    assert.equal(tag.description, '');
  });

  it('works with only a name', function() {
    var docstring = multiline(function() {;
      // @module foo.bar
    });

    var rawTag = subject.parseTag(docstring.trim());
    var tag = parser.createTag(rawTag);

    assert.equal(tag.name, 'foo.bar');
    assert.equal(tag.description, '');
  });

  it('works with only a description', function() {
    var docstring = multiline(function() {;
      // @module
      // Some description.
    }, true);

    var rawTag = subject.parseTag(docstring.trim());
    var tag = parser.createTag(rawTag);

    assert.equal(tag.name, '');
    assert.equal(tag.description, 'Some description.');
  });

  it('works with both a name and a description', function() {
    var docstring = multiline(function() {;
      // @module foo.bar
      // Some
      // multiline
      // description.
    }, true);

    var rawTag = subject.parseTag(docstring.trim());
    var tag = parser.createTag(rawTag);

    assert.equal(tag.name, 'foo.bar');
    assert.equal(tag.description, 'Some\nmultiline\ndescription.');
  });
});