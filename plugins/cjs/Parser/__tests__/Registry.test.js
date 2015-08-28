var Parser = require('../index');
var assert = require('chai').assert;

function parse(strGenerator) {
  var parser = new Parser();

  parser.parseString(
    global.TestUtils.getInlineString(strGenerator),
    {},
    ''
  );

  return parser;
}

describe('CJS::Parser::Registry', function() {
  describe('#findClosestModuleToPath', function() {
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
        registry.findClosestModuleToPath(registry.get('someProp').$path),
        registry.get('SomeModule').id
      );
    });
  });
});