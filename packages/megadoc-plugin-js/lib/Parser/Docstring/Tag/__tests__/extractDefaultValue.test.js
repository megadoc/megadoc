var subject = require('../extractDefaultValue');
var assert = require('chai').assert;

describe('CJS::Parser::Docstring::Tag::extractDefaultValue', function() {
  [
    { string: "foo", returnValue: null },
    { string: "[foo]", name: 'foo', defaultValue: null },
    { string: "[foo='bar']", name: 'foo', defaultValue: "'bar'" },
    { string: "[foo={}]", name: 'foo', defaultValue: "{}" },
    { string: "[foo={ a: 'bar' }]", name: 'foo', defaultValue: "{ a: 'bar' }" },
    { string: "[foo=null]", name: 'foo', defaultValue: "null" },
    { string: "[foo=5]", name: 'foo', defaultValue: "5" },
    { string: "[foo=5.21]", name: 'foo', defaultValue: "5.21" },
    { string: "[foo=[]]", name: 'foo', defaultValue: "[]" },
    { string: "[foo=['a']]", name: 'foo', defaultValue: "['a']" },
    { string: "[ foo = [\"a\"] ]", name: 'foo', defaultValue: "[\"a\"]" },
    { string: "[foo = ]]", name: 'foo', defaultValue: "]" },
    { string: "[foo = []", name: 'foo', defaultValue: "[" },
  ].forEach(function(spec) {
    it("works for '" + spec.string + "'", function() {
      var info = subject(spec.string);

      if (spec.hasOwnProperty('returnValue')) {
        assert.equal(info, spec.returnValue);
      }
      else {
        assert.equal(info.name, spec.name);
        assert.equal(info.defaultValue, spec.defaultValue);
      }
    });
  });
});