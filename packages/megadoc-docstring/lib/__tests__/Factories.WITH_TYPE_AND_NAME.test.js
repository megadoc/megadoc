var multiline = require('multiline-slash');
var subject = require('../parser');
var assert = require('chai').assert;
var Parser = subject.Parser;

describe('Parser.FACTORIES.withNameAndType', function() {
  var parser;

  function parseTag(str) {
    var docstring = multiline(str);

    return parser.createTag(subject.parseTag(docstring.trim()));
  }

  beforeEach(function() {
    parser = new Parser();
    parser.defineTag('param', Parser.FACTORIES.withNameAndType);
  });

  it('works with only a type', function() {
    var tag = parseTag(function() {
      // @param {string}
    });

    assert.ok(tag.hasOwnProperty('typeInfo'));
    assert.equal(tag.typeInfo.types.length, 1);
    assert.equal(tag.name, '');
    assert.equal(tag.description, '');
  });

  it('works with a type and name', function() {
    var tag = parseTag(function() {
      // @param {string} foo
    });

    assert.ok(tag.hasOwnProperty('typeInfo'));
    assert.equal(tag.typeInfo.types.length, 1);
    assert.equal(tag.name, 'foo');
    assert.equal(tag.description, '');
  });

  it('works with a type, name, and description', function() {
    var tag = parseTag(function() {
      // @param {string} foo
      //        Hello.
    });

    assert.ok(tag.hasOwnProperty('typeInfo'));
    assert.equal(tag.typeInfo.types.length, 1);
    assert.equal(tag.name, 'foo');
    assert.equal(tag.description, 'Hello.');
  });

  it('detects an optional thingy ([foo])', function() {
    var tag = parseTag(function() {
      // @param {string} [foo]
      //        Hello.
    });

    assert.equal(tag.typeInfo.optional, true);
    assert.equal(tag.name, 'foo');
  });

  it('detects a default value ([foo=5])', function() {
    var tag = parseTag(function() {
      // @param {string} [foo=5]
      //        Hello.
    });

    assert.equal(tag.typeInfo.optional, true);
    assert.equal(tag.name, 'foo');
  });
});