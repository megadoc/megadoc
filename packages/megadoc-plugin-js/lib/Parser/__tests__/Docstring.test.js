var Docstring = require('../Docstring');
var assert = require('chai').assert;
var multiline = require('multiline-slash');

var parse = function(strGenerator, customTags, filePath) {
  var comment = multiline(strGenerator);

  return new Docstring(comment, customTags, filePath);
};

describe('CJS::Parser::Docstring', function() {
});

describe('CJS::Parser::Docstring::Tag', function() {
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
    it('parses the module path', function() {
      var docstring = parse(function() {;
        // /**
        //  * @module Dragon
        //  */
      });

      assert.equal(docstring.id, 'Dragon');
    });

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

      assert.equal(docstring.namespace, 'Hairy');
    });
  });

  describe('@property', function() {
    it('parses a single type', function() {
      var docstring = parse(function() {;
        // /**
        //  * @property {String}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String' ]);
    });

    it('parses multiple types', function() {
      var docstring = parse(function() {;
        // /**
        //  * @property {String|Object}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String', 'Object' ]);
    });

    it('parses the name', function() {
      var docstring = parse(function() {;
        // /**
        //  * @property {String} foo
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.name, 'foo');
    });

    it('parses an optional property', function() {
      var docstring = parse(function() {;
        // /**
        //  * @property {String} [foo]
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.isOptional, true);
      assert.equal(docstring.tags[0].typeInfo.name, 'foo');
    });

    it('parses the default value', function() {
      var docstring = parse(function() {;
        // /**
        //  * @property {String} [foo='bar']
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.defaultValue, "'bar'");
    });

    it('parses the description', function() {
      var docstring = parse(function() {;
        // /**
        //  * @property {String} foo
        //  *           Something.
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.description, 'Something.');
    });

    it('strips leading whitespace from description', function() {
      var docstring = parse(function() {;
        // /**
        //  * @property {String} foo
        //  *           This
        //  *           is
        //  *           a
        //  *           multiline
        //  *           description.
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.description,
        'This\nis\na\nmultiline\ndescription.'
      );
    });
  });

  describe('@return', function() {
    it('parses a single type', function() {
      var docstring = parse(function() {;
        // /**
        //  * @return {String}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String' ]);
    });

    it('parses multiple types', function() {
      var docstring = parse(function() {;
        // /**
        //  * @return {String|Object}
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'String', 'Object' ]);
    });

    it('parses the name', function() {
      var docstring = parse(function() {;
        // /**
        //  * @return {String} foo
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.name, 'foo');
      assert.equal(docstring.tags[0].typeInfo.description, undefined);
    });

    it('parses the description', function() {
      var docstring = parse(function() {;
        // /**
        //  * @return {String} foo
        //  *         Something.
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.name, 'foo');
      assert.equal(docstring.tags[0].typeInfo.description, 'Something.');
    });

    it('parses the description without a name', function() {
      var docstring = parse(function() {;
        // /**
        //  * @return {String}
        //  *         Something.
        //  */
      });

      assert.equal(docstring.tags.length, 1);
      assert.equal(docstring.tags[0].typeInfo.name, undefined);
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
      var docstring = parse(function() {;
        // /**
        //  * @live_example {jsx}
        //  */
      }, { customTags: customTags });

      assert.equal(docstring.tags.length, 1);
      assert.deepEqual(docstring.tags[0].typeInfo.types, [ 'jsx' ]);
    });

    it('accepts a custom processor', function(done) {
      parse(function() {;
        // /**
        //  * @live_example {jsx}
        //  */
      }, {
        customTags: {
          live_example: {
            withTypeInfo: true,
            process: function(tag) {
              assert.ok(tag);
              done();
            }
          }
        }
      });
    });

    it('accepts custom attributes', function(done) {
      parse(function() {;
        // /**
        //  * @live_example {jsx}
        //  */
      }, {
        customTags: {
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
        }
      });
    });

    it('whines if attempting to write to an unspecified attribute', function(done) {
      parse(function() {;
        // /**
        //  * @live_example {jsx}
        //  *
        //  *     <Button />
        //  */
      }, {
        customTags: {
          live_example: {
            withTypeInfo: true,
            process: function(tag) {
              assert.throws(function() {
                tag.setCustomAttribute('foo', 'bar');
              }, /Unrecognized custom attribute/);

              done();
            }
          }
        }
      });
    });

    it('serializes custom attributes', function() {
      var docstring = parse(function() {;
        // /**
        //  * @live_example {jsx}
        //  */
      }, {
        customTags: {
          live_example: {
            withTypeInfo: true,
            attributes: [ 'width' ],
            process: function(tag) {
              tag.setCustomAttribute('width', 240);
            }
          }
        }
      });

      assert.equal(docstring.toJSON().tags[0].width, 240);
    });
  });

  describe('neutralizing whitespace', function() {
    it('sample 1: an example with a name and code body', function() {
      var docstring = parse(function() {;
        // /**
        //  * @example A child screen
        //  *
        //  *     module.exports = {
        //  *       name: 'author.user',
        //  *       path: ':userId',
        //  *       parent: 'author.users'
        //  *     };
        //  *
        //  *     // visitable at "/author/users/1" or "/author/users/:userId"
        //  *
        //  */
      });

      assert.equal(docstring.tags.length, 1);

      assert.equal(docstring.tags[0].typeInfo.name, 'A child screen');
      assert.deepEqual(docstring.tags[0].typeInfo.description, [
        "    module.exports = {",
        "      name: 'author.user',",
        "      path: ':userId',",
        "      parent: 'author.users'",
        "    };",
        "",
        "    // visitable at \"/author/users/1\" or \"/author/users/:userId\"",
      ].join('\n'));
    });

    it('sample 2: with no name', function() {
      var docstring = parse(function() {;
        // /**
        //  * @example
        //  *
        //  * A child screen.
        //  *
        //  *     module.exports = {
        //  *       name: 'author.user',
        //  *       path: ':userId',
        //  *       parent: 'author.users'
        //  *     };
        //  *
        //  *     // visitable at "/author/users/1" or "/author/users/:userId"
        //  *
        //  */
      });

      assert.equal(docstring.tags.length, 1);

      assert.equal(docstring.tags[0].typeInfo.name, null);
      assert.deepEqual(docstring.tags[0].typeInfo.description, [
        "A child screen.",
        "",
        "    module.exports = {",
        "      name: 'author.user',",
        "      path: ':userId',",
        "      parent: 'author.users'",
        "    };",
        "",
        "    // visitable at \"/author/users/1\" or \"/author/users/:userId\"",
      ].join('\n'));
    });

    it('sample 3: example with code only', function() {
      var docstring = parse(function() {;
        // /**
        //  * @example
        //  *
        //  *     module.exports = {
        //  *       name: 'author.user',
        //  *       path: ':userId',
        //  *       parent: 'author.users'
        //  *     };
        //  *
        //  *     // visitable at "/author/users/1" or "/author/users/:userId"
        //  *
        //  */
      });

      assert.equal(docstring.tags.length, 1);

      assert.equal(docstring.tags[0].typeInfo.name, null);
      assert.deepEqual(docstring.tags[0].typeInfo.description, [
        "    module.exports = {",
        "      name: 'author.user',",
        "      path: ':userId',",
        "      parent: 'author.users'",
        "    };",
        "",
        "    // visitable at \"/author/users/1\" or \"/author/users/:userId\"",
      ].join('\n'));
    });
  });
});