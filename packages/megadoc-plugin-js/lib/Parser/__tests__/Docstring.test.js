var Docstring = require('../Docstring');
var assert = require('chai').assert;
var multiline = require('multiline-slash');

var parse = function(strGenerator, customTags, filePath) {
  var comment = multiline(strGenerator);

  return new Docstring(comment, customTags, filePath);
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

      assert.equal(docstring.id, 'Hairy.Dragon');
      assert.equal(docstring.namespace, 'Hairy');
    });
  });
});