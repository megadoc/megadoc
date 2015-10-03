var Docstring = require('../Docstring');
var assert = require('chai').assert;

var parse = function(strGenerator, customTags, filePath) {
  var comment = global.TestUtils.getInlineString(strGenerator);

  return new Docstring(comment, customTags, filePath);
};

describe('CJS::Parser::Docstring', function() {
});

describe('CJS::Parser::Docstring::Tag', function() {
  describe('@module', function() {
    it('parses the module path', function() {
      var docstring = parse(function() {
        // /**
        //  * @module Dragon
        //  */
      });

      assert.equal(docstring.id, 'Dragon');
    });

    it('parses "description" and omits the module path from it', function() {
      var docstring = parse(function() {
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
      var docstring = parse(function() {
        // /**
        //  * @namespace Hairy
        //  */
      });

      assert.equal(docstring.namespace, 'Hairy');
    });

    it('parses an inline namespace in a @module path', function() {
      var docstring = parse(function() {
        // /**
        //  * @module Hairy.Dragon
        //  */
      });

      assert.equal(docstring.namespace, 'Hairy');
    });
  });

  describe('@property', function() {
    it('parses a single type', function() {
      var docstring = parse(function() {
        // /**
        //  * @property {String}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String' ]);
    });

    it('parses multiple types', function() {
      var docstring = parse(function() {
        // /**
        //  * @property {String|Object}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String', 'Object' ]);
    });

    it('parses the name', function() {
      var docstring = parse(function() {
        // /**
        //  * @property {String} foo
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.name, 'foo');
    });

    it('parses an optional property', function() {
      var docstring = parse(function() {
        // /**
        //  * @property {String} [foo]
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.isOptional, true);
      assert.equal(docstring.tags[0].typeInfo.name, 'foo');
    });

    it('parses the default value', function() {
      var docstring = parse(function() {
        // /**
        //  * @property {String} [foo='bar']
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.defaultValue, "'bar'");
    });

    it('parses the description', function() {
      var docstring = parse(function() {
        // /**
        //  * @property {String} foo
        //  *           Something.
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.description, 'Something.');
    });
  });

  describe('@return', function() {
    it('parses a single type', function() {
      var docstring = parse(function() {
        // /**
        //  * @return {String}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String' ]);
    });

    it('parses multiple types', function() {
      var docstring = parse(function() {
        // /**
        //  * @return {String|Object}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String', 'Object' ]);
    });

    it('parses the name', function() {
      var docstring = parse(function() {
        // /**
        //  * @return {String} foo
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.name, 'foo');
    });

    it('parses the description', function() {
      var docstring = parse(function() {
        // /**
        //  * @return {String} foo
        //  *         Something.
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.description, 'Something.');
    });

    it('parses the description without a name', function() {
      var docstring = parse(function() {
        // /**
        //  * @return {String}
        //  *         Something.
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.description, 'Something.');
    });
  });

  describe('custom tag: @live_example', function() {
    var customTags = {
      live_example: {
        withTypeInfo: true
      }
    };

    it('parses the example type', function() {
      var docstring = parse(function() {
        // /**
        //  * @live_example {jsx}
        //  */
      }, customTags);

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'jsx' ]);
    });

    it('accepts a custom processor', function(done) {
      parse(function() {
        // /**
        //  * @live_example {jsx}
        //  */
      }, {
        live_example: {
          withTypeInfo: true,
          process: function(tag) {
            assert.ok(tag);
            done();
          }
        }
      });
    });

    it('accepts custom attributes', function(done) {
      parse(function() {
        // /**
        //  * @live_example {jsx}
        //  */
      }, {
        live_example: {
          withTypeInfo: true,
          attributes: [ 'width' ],
          process: function(tag) {
            assert.doesNotThrow(function() {
              tag.setCustomAttribute('width', 240);
            });

            done();
          }
        }
      });
    });

    it('whines if attempting to write to an unspecified attribute', function(done) {
      parse(function() {
        // /**
        //  * @live_example {jsx}
        //  *
        //  *     <Button />
        //  */
      }, {
        live_example: {
          withTypeInfo: true,
          process: function(tag) {
            assert.throws(function() {
              tag.setCustomAttribute('foo', 'bar');
            }, /Unrecognized custom attribute/);

            done();
          }
        }
      });
    });

    it('serializes custom attributes', function() {
      var docstring = parse(function() {
        // /**
        //  * @live_example {jsx}
        //  */
      }, {
        live_example: {
          withTypeInfo: true,
          attributes: [ 'width' ],
          process: function(tag) {
            tag.setCustomAttribute('width', 240);
          }
        }
      });

      assert.equal(docstring.toJSON().tags[0].width, 240);
    });
  });
});