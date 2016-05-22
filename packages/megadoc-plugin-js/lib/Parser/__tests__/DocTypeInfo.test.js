var Subject = require("../DocTypeInfo");
var assert = require('chai').assert;
var parseNode = require('../TestUtils').parseNode;
var sinonSuite = require('megadoc/lib/TestUtils').sinonSuite;

function parse(strGenerator) {
  return Subject(parseNode(strGenerator)[0]);
}

describe('CJS::Parser::DocTypeInfo', function() {
  var sinon = sinonSuite(this);

  describe('for functions...', function() {
    it('uses a parameter name from the comment if it is present', function() {
      var subject = parse(function() {;
        // /**
        //  * @param {String} xoxo
        //  *        Test.
        //  */
        //  function x(name) {}
      });

      assert.equal(subject.name, 'Function');
      assert.ok(subject.params);
      assert.include(subject.params[0], { name: 'xoxo' });
    });

    it('uses a parameter name from the code if it is not specified in the comment', function() {
      var subject = parse(function() {;
        // /**
        //  * @param {String}
        //  *        Test.
        //  */
        //  function x(name) {}
      });

      assert.equal(subject.name, 'Function');
      assert.ok(subject.params);
      assert.include(subject.params[0], { name: 'name' });
    });

    it('warns if param name is missing and there is a count mismatch', function() {
      sinon.stub(console, 'warn');

      var subject = parse(function() {;
        // /**
        //  * @param {Object} x
        //  * @param {Object} x.foo
        //  * @param {Number}
        //  */
        //  function x(x, y) {}
      });

      assert.include(subject.params[0], { name: 'x' });
      assert.include(subject.params[1], { name: 'x.foo' });
      assert.include(subject.params[2], { name: '<<unknown>>' });

      assert.calledWith(console.warn, sinon.match(/Parameter name is missing/));
    });

    it('uses parameter node info only when the names match (not by index)', function() {
      var subject = parse(function() {;
        // /**
        //  * @param {Object} x
        //  * @param {String} x.foo
        //  * @param {Number} y
        //  */
        //  function Foo(x, y = 5) {}
      });

      assert.ok(subject.params);
      assert.include(subject.params[0], { name: 'x' });
      assert.include(subject.params[0].type, { name: 'Object' });

      assert.include(subject.params[1], { name: 'x.foo' });
      assert.include(subject.params[1].type, { name: 'String' });

      assert.include(subject.params[2], { name: 'y', defaultValue: 5 });
      assert.include(subject.params[2].type, { name: 'Number' });
    });
  });
});