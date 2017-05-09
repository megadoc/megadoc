var Docstring = require('../Docstring');
var assert = require('chai').assert;
var multiline = require('multiline-slash');
var EventEmitter = require('events');

function parse(strGenerator) {
  var comment = multiline(strGenerator);

  return new Docstring(comment, {
    emitter: new EventEmitter()
  });
};

describe('CJS::Parser::Docstring', function() {
  it('parses inline "description"', function() {
    var docstring = parse(function() {;
      // /**
      //  * @param {String} name this is a description
      //  */
      //  function(name) {}
    });

    assert.equal(docstring.tags[0].typeInfo.name, 'name');
    assert.equal(docstring.tags[0].typeInfo.description, 'this is a description');
  });

  describe('@module', function() {
    it('parses "description" and omits the module path from it', function() {
      var docstring = parse(function() {;
        // /**
        //  * @module Dragon
        //  *
        //  * Here be dragons.
        //  */
      });

      assert.equal(docstring.description, 'Here be dragons.');
    });
  });

  describe('@namespace', function() {
    it('parses', function() {
      var docstring = parse(function() {;
        // /**
        //  * @namespace Hairy
        //  */
      });

      assert.equal(docstring.namespace, 'Hairy');
    });

    it('parses an inline namespace in a @module path', function() {
      var docstring = parse(function() {;
        // /**
        //  * @module Hairy.Dragon
        //  */
      });

      assert.equal(docstring.name, 'Dragon');
      assert.equal(docstring.namespace, 'Hairy');
    });
  });

  describe('@callback', function() {
    it('parses', function() {
      var docstring = parse(function() {;
        // /**
        //  * @module Cocache
        //  *
        //  * @param {Object} options
        //  * @param {Function} [options.onChange]
        //  * @param {Function} [options.idGenerator]
        //  * @param {Array.<Cocache~RecordValidator>} [options.recordValidators=[]]
        //  * @param {String} [options.displayName='<<anonymous>>']
        //  * @param {Boolean} [options.optimized=true]
        //  *
        //  * @callback Cocache~RecordValidator
        //  *
        //  * @param {Any} record
        //  *        The record to validate.
        //  *
        //  * @param {Object} options
        //  *        The options the cache instance was built with.
        //  *
        //  * @param {String} displayName
        //  *        The cache instance's displayName. Use this in your error reporting.
        //  *
        //  * @return {void}
        //  */
      });

      assert.equal(docstring.name, 'Cocache');
      assert.equal(docstring.tags.length, 7);
      assert.equal(docstring.typeDefs.length, 1);
      assert.equal(docstring.typeDefs[0].name, 'Cocache~RecordValidator');
      assert.equal(docstring.typeDefs[0].tags.length, 5);
    });
  });
});