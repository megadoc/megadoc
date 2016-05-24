var Tag = require('../Docstring__Tag');
var EventEmitter = require('events');
var commentParser = require('../parseComment');
var assert = require('chai').assert;
var multiline = require('multiline-slash');

var parse = function(strGenerator, options, filePath) {
  var comment = typeof strGenerator === 'function' ? multiline(strGenerator) : strGenerator;
  var node = commentParser(comment);

  return new Tag(node[0].tags[0], {
    config: options || {},
    filePath: filePath,
    emitter: new EventEmitter()
  });
};

describe('CJS::Parser::Docstring::Tag', function() {
  it('parses inline "description"', function() {
    var tag = parse(function() {;
      // /**
      //  * @param {String} name this is a description
      //  */
    });

    assert.equal(tag.typeInfo.name, 'name');
    assert.equal(tag.typeInfo.description, 'this is a description');
  });

  describe('@module', function() {
    it('parses the module path', function() {
      var tag = parse(function() {;
        // /**
        //  * @module Dragon
        //  */
      });

      assert.equal(tag.typeInfo.name, 'Dragon');
    });

    it('parses the module path with a namespace', function() {
      var tag = parse(function() {;
        // /**
        //  * @module NS.Dragon
        //  */
      });

      assert.equal(tag.typeInfo.name, 'NS.Dragon');
    });
  });

  describe('@namespace', function() {
    it('parses', function() {
      var tag = parse(function() {;
        // /**
        //  * @namespace Hairy
        //  */
      });

      assert.equal(tag.typeInfo.name, 'Hairy');
    });

    it('parses an inline namespace in a @module path', function() {
      var tag = parse(function() {;
        // /**
        //  * @module Hairy.Dragon
        //  */
      });

      assert.equal(tag.typeInfo.name, 'Hairy.Dragon');
    });
  });

  describe('@property', function() {
    it('parses a single type', function() {
      var tag = parse(function() {;
        // /**
        //  * @property {String}
        //  */
      });

      assert.include(tag.typeInfo.type, { name: 'String' });
    });

    it('parses multiple types', function() {
      var tag = parse(function() {;
        // /**
        //  * @property {String|Object}
        //  */
      });

      assert.include(tag.typeInfo.type, { name: 'Union' });
    });

    it('parses the name', function() {
      var tag = parse(function() {;
        // /**
        //  * @property {String} foo
        //  */
      });

      assert.equal(tag.typeInfo.name, 'foo');
      assert.include(tag.typeInfo.type, { name: 'String' });
    });

    it('parses an optional property', function() {
      var tag = parse(function() {;
        // /**
        //  * @property {String} [foo]
        //  */
      });

      assert.equal(tag.typeInfo.isOptional, true);
      assert.equal(tag.typeInfo.name, 'foo');
    });

    describe('defaultValue', function() {
      [
        { string: "foo", returnValue: null },
        { string: "[foo]", defaultValue: null },
        { string: "[foo='bar']", defaultValue: "bar" },
        { string: "[foo=\"bar\"]", defaultValue: "bar" },
        { string: "[foo={}]", defaultValue: "{}" },
        { string: "[foo={ a: 'bar' }]", defaultValue: "{ a: 'bar' }" },
        { string: "[foo=null]", defaultValue: "null" },
        { string: "[foo=5]", defaultValue: "5" },
        { string: "[foo=5.21]", defaultValue: "5.21" },
        { string: "[foo=[]]", defaultValue: "[]" },
        { string: "[foo=['a']]", defaultValue: "['a']" },
        { string: "[ foo = [\"a\"] ]", defaultValue: " [\"a\"] " },
        { string: "[foo = ]]", error: 'Invalid `name`, unpaired brackets' },
        { string: "[foo = []", error: 'Invalid `name`, unpaired brackets' },
      ].forEach(function(sample) {
        it('parses a default value of "' + sample.defaultValue + '" => "' + sample.defaultValue + '"', function() {
          var docstring = '/** @property {Mixed} ' + sample.string + ' */'

          if (sample.error) {
            assert.throws(function() {
              parse(docstring);
            }, sample.error);
          }
          else {
            var tag = parse(docstring);

            assert.equal(tag.typeInfo.name, 'foo');
            assert.equal(tag.typeInfo.defaultValue, sample.defaultValue);
          }
        });
      });
    });

    it('parses the description', function() {
      var tag = parse(function() {;
        // /**
        //  * @property {String} foo
        //  *           Something.
        //  */
      });

      assert.equal(tag.typeInfo.description, 'Something.');
    });

    it('strips leading whitespace from description', function() {
      var tag = parse(function() {;
        // /**
        //  * @property {String} foo
        //  *           This
        //  *           is
        //  *           a
        //  *           multiline
        //  *           description.
        //  */
      });

      assert.equal(tag.typeInfo.description,
        'This\nis\na\nmultiline\ndescription.'
      );
    });
  });

  describe('@return', function() {
    it('parses a single type', function() {
      var tag = parse(function() {;
        // /**
        //  * @return {String}
        //  */
      });

      assert.include(tag.typeInfo.type, { name: 'String' });
    });

    it('parses multiple types', function() {
      var tag = parse(function() {;
        // /**
        //  * @return {String|Object}
        //  */
      });

      assert.include(tag.typeInfo.type, { name: 'Union' });
    });

    it('parses the name', function() {
      var tag = parse(function() {;
        // /**
        //  * @return {String} foo
        //  */
      });

      assert.equal(tag.typeInfo.name, 'foo');
      assert.equal(tag.typeInfo.description, undefined);
    });

    it('parses name and description', function() {
      var tag = parse(function() {;
        // /**
        //  * @return {String} foo
        //  *         Something.
        //  */
      });

      assert.equal(tag.typeInfo.name, 'foo');
      assert.equal(tag.typeInfo.description, 'Something.');
    });

    it('parses description without a name', function() {
      var tag = parse(function() {;
        // /**
        //  * @return {String}
        //  *         Something.
        //  */
      });

      assert.equal(tag.typeInfo.name, undefined);
      assert.equal(tag.typeInfo.description, 'Something.');
    });

    it('parses inline description without a name', function() {
      var tag = parse(function() {;
        // /**
        //  * @return {true} If the record is valid.
        //  */
      }, { namedReturnTags: false });

      assert.equal(tag.typeInfo.name, undefined);
      assert.equal(tag.typeInfo.description, 'If the record is valid.');
    });
  });

  describe('custom tag: @live_example', function() {
    var customTags = {
      live_example: {
        withTypeInfo: true
      }
    };

    it('parses the example type', function() {
      var tag = parse(function() {;
        // /**
        //  * @live_example {jsx}
        //  */
      }, { customTags: customTags });

      assert.include(tag.typeInfo.type, { name: 'jsx' });
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
      var tag = parse(function() {;
        // /**
        //  * @live_example {jsx}
        //  */
      }, {
        customTags: {
          live_example: {
            withTypeInfo: true,
            attributes: [ 'width' ],
            process: function(x) {
              x.setCustomAttribute('width', 240);
            }
          }
        }
      });

      assert.equal(tag.toJSON().width, 240);
    });
  });

  describe('neutralizing whitespace', function() {
    it.skip('sample 1: an example with a name and code body', function() {
      var tag = parse(function() {;
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

      assert.equal(tag.typeInfo.name, 'A child screen');
      assert.deepEqual(tag.typeInfo.description, [
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
      var tag = parse(function() {;
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
        //  */
      });


      assert.equal(tag.typeInfo.name, null);
      assert.deepEqual(tag.typeInfo.description, [
        // "",
        "A child screen.",
        "",
        "    module.exports = {",
        "      name: 'author.user',",
        "      path: ':userId',",
        "      parent: 'author.users'",
        "    };",
        "",
        "    // visitable at \"/author/users/1\" or \"/author/users/:userId\"",
        // "",
      ].join('\n'));
    });

    it('sample 3: example with code only', function() {
      var tag = parse(function() {;
        // /**
        //  * @example
        //  *     module.exports = {
        //  *       name: 'author.user',
        //  *       path: ':userId',
        //  *       parent: 'author.users'
        //  *     };
        //  *
        //  *     // visitable at "/author/users/1" or "/author/users/:userId"
        //  */
      });


      assert.equal(tag.typeInfo.name, null);
      assert.deepEqual(tag.typeInfo.description, [
        "    module.exports = {",
        "      name: 'author.user',",
        "      path: ':userId',",
        "      parent: 'author.users'",
        "    };",
        "",
        "    // visitable at \"/author/users/1\" or \"/author/users/:userId\"",
        // ""
      ].join('\n'));
    });
  });
});