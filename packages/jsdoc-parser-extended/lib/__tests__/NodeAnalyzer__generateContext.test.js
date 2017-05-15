var assert = require('chai').assert;
var parseNode = require('../TestUtils').parseNode;
var K = require('../constants');

function parse(strGenerator) {
  return parseNode(strGenerator)[0].nodeInfo.ctx;
}

describe('CJS::Parser::NodeAnalyzer::generateContext', function() {
  describe('for literals...', function() {
    it('slaps the node value as "nodeValue" for use in place of defaultValue when needed', function() {
      var subject = parse(function() {;
        // /**
        //  */
        //  var x = 'hello';
      });

      assert.equal(subject.type, K.TYPE_LITERAL);
      assert.equal(subject.value, 'hello');
    });
  });

  describe('for objects...', function() {
    it('extracts the properties', function() {
      var subject = parse(function() {;
        // /**
        //  */
        //  var x = { foo: "bar" };
      });

      assert.equal(subject.type, K.TYPE_OBJECT);
      assert.equal(subject.properties.length, 1);
      assert.equal(subject.properties[0].key, 'foo');
      assert.include(subject.properties[0].value, { type: K.TYPE_LITERAL, value: 'bar' });
    });
  });

  describe('for arrays...', function() {
    it('slaps the node value as "nodeValue" for use in place of defaultValue when needed', function() {
      var subject = parse(function() {;
        // /**
        //  */
        //  var x = [ 'hello', 3, { foo: "bar" } ];
      });

      assert.equal(subject.type, K.TYPE_ARRAY);
      assert.include(subject.elements[0], { type: 'Literal', value: 'hello' });
      assert.include(subject.elements[1], { type: 'Literal', value: 3 });
      assert.include(subject.elements[2], { type: 'Object' });
    });
  });

  describe('for functions...', function() {
    it('uses a parameter name from the comment if it is present', function() {
      var subject = parse(function() {;
        // /**
        //  */
        //  function x(name) {}
      });

      assert.ok(subject.params);
      assert.include(subject.params[0], { name: 'name' });
    });

    it('warns if param name is missing and there is a count mismatch', function() {
      var subject = parse(function() {;
        // /**
        //  */
        // function x(x, y) {}
      });

      assert.include(subject.params[0], { name: 'x' });
      assert.include(subject.params[1], { name: 'y' });
    });

    it('uses parameter node info only when the names match (not by index)', function() {
      var subject = parse(function() {;
        // /**
        //  */
        //  function Foo(x, y = 5) {}
      });

      assert.ok(subject.params);
      assert.include(subject.params[0], { name: 'x' });
      assert.include(subject.params[1], { name: 'y', defaultValue: 5 });
    });
  });
});