var DoxParser = require('../DoxParser');
var assert = require('assert');

function parse(filePath, options) {
  var docs = DoxParser.parseFile(TestUtils.getFixturePath(filePath), options || {});
  DoxParser.postProcess(docs);
  return docs;
}

describe('DoxParser', function() {
  describe('parsing a class with a static method', function() {
    var docs;

    beforeEach(function() {
      docs = parse('cjs/class_with_static_method.js');
      assert.equal(docs.length, 4);
    });

    it('should work with a static method that accepts no params', function() {
      assert.equal(docs[1].ctx.receiver, 'Core.Store');
      assert.ok(docs[1].isStatic);
    });

    it('should work with a static method that accepts params', function() {
      assert.equal(docs[2].ctx.receiver, 'Core.Store');
      assert.ok(docs[2].isStatic);
    });

    it('should work with a method marked @static', function() {
      assert.equal(docs[3].ctx.receiver, 'Core.Store');
      assert.ok(docs[3].isStatic);
    });
  });

  describe('constructors', function() {
    var docs;

    beforeEach(function() {
      docs = parse('cjs/class_with_ctor.js');
      assert.equal(docs.length, 1);
    });

    it('should work', function() {
      assert.ok(docs[0].isConstructor);
    });
  });

  describe('function modules', function() {
    var docs;

    it('works with a named function', function() {
      docs = parse('cjs/function.js');
      assert.equal(docs.length, 1);

      assert.equal(docs[0].ctx.type, 'function');
      assert.equal(docs[0].id, 'Functor');
      assert.ok(!docs[0].isModule);
      assert.ok(docs[0].isFunction);
    });

    it('works with an exported, named function', function() {
      docs = parse('cjs/function_exported.js');
      assert.equal(docs.length, 1);

      assert.equal(docs[0].ctx.type, 'function');
      assert.equal(docs[0].id, 'Functor');
      assert.ok(!docs[0].isModule);
      assert.ok(docs[0].isFunction);
    });

    it('does not work with a named function and @module tag', function() {
      docs = parse('cjs/function_module.js');
      assert.equal(docs.length, 1);

      assert.equal(docs[0].ctx.type, 'function');
      assert.equal(docs[0].id, 'Something.');
      assert.ok(docs[0].isModule);
      assert.ok(docs[0].isFunction);
    });

    it('works with a module.exports and @module tag', function() {
      docs = parse('cjs/function_module_exports.js');
      assert.equal(docs.length, 1);

      assert.equal(docs[0].ctx.type, 'function');
      assert.ok(docs[0].isFunction);
    });

    it('does not work with a named module.exports', function() {
      docs = parse('cjs/function_module_named_exports.js');
      assert.equal(docs.length, 1);

      assert.equal(docs[0].ctx.type, 'function');
      assert.equal(docs[0].id, 'module.exports');
      assert.ok(docs[0].isFunction);
    });
  });

  describe('[gh#1] module definition across multiple files', function() {
    it('works', function() {
      var mainDocs = parse('cjs/module_a_part1.js');
      var auxDocs = parse('cjs/module_a_part2.js');

      assert.equal(auxDocs.length, 1);
      assert.equal(auxDocs[0].ctx.receiver, mainDocs[0].id);
    });
  });

  describe('[gh#3] module static methods should use the "." symbol', function() {
    it('works', function() {
      docs = parse('cjs/module_with_static_methods.js');

      assert.equal(docs.length, 2);
      assert.equal(docs[1].symbol, '.');
      assert.equal(docs[1].id, 'Duck.quack');
    });

    it('works with named exports', function() {
      docs = parse('cjs/exports_with_static_methods.js');

      assert.equal(docs.length, 2);
      assert.equal(docs[1].symbol, '.');
      assert.equal(docs[1].id, 'Transitioner.canTransition');
    });
  });
});
