var Parser = require('../index');
var assert = require('chai').assert;
var multiline = require('multiline-slash');

function parse(strGenerator) {
  var parser = new Parser();

  parser.parseString(multiline(strGenerator), {}, '');

  return parser;
}

describe('CJS::Parser::Registry', function() {
  describe('#findClosestModule', function() {
    it('should work', function() {
      var parser = parse(function() {
        // /**
        //  * @module
        //  */
        // function SomeModule() {
        //   return {
        //     /**
        //      * @property {Object} someProp
        //      *           Something
        //      */
        //     someProp: {}
        //   };
        // }
      });

      var registry = parser.registry;

      assert.equal(registry.size, 2);
      assert.equal(
        registry.findClosestModule(registry.get('someProp').$path),
        registry.get('SomeModule').id
      );
    });
  });
});