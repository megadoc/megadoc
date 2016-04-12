var assert = require('assert');
var multiline = require('multiline-slash');
var subject = require('../');

function parse(str) {
  return subject.parseString(multiline(str));
}

describe('Lua::Parser', function() {
  it('should work', function() {
    var docs = parse(function() {
      // --- @module foo
      // local foo = {}
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].id, 'foo');
    assert.equal(docs[0].tags.length, 1);
    assert.equal(docs[0].tags[0].type, 'module');
  });

  it('parses a function parameter', function() {
    var docs = parse(function() {
      // ---
      // --- @param {string} s
      // ---        Something.
      // function do_something(s)
      // end
    });

    assert(docs.length === 1);
    assert.equal(docs[0].id, 'do_something')
    assert.equal(docs[0].tags.length, 1);
    assert.equal(docs[0].tags[0].type, 'param');
    assert.deepEqual(docs[0].tags[0].typeInfo.types, ['string']);
    assert.deepEqual(docs[0].tags[0].description, 'Something.');
  });

  it('parses a function parameter', function() {
    var docs = parse(function() {
      // ---
      // --- Sets the amount of space allocated to the argument keys and descriptions
      // --- in the help listing.
      // ---
      // --- The sizes are used for wrapping long argument keys and descriptions.
      // ---
      // --- @param {number} [key_cols=0]
      // ---        The number of columns assigned to the argument keys, set to 0 to
      // ---        auto detect.
      // ---
      // --- @param {number} [desc_cols=0]
      // ---        The number of columns assigned to the argument descriptions, set to
      // ---        0 to auto set the total width to 72.
      // function cli:set_colsz(w, h)
      // end
    });

    assert(docs.length === 1);
    assert.equal(docs[0].id, 'set_colsz')
    assert.deepEqual(
      docs[0].description.trim(),
      multiline(function() {
        // Sets the amount of space allocated to the argument keys and descriptions
        // in the help listing.
        //
        // The sizes are used for wrapping long argument keys and descriptions.
      }, true).trim(),
      'it removes the tag descriptions'
    );

    assert.equal(docs[0].tags.length, 2);
    assert.equal(docs[0].tags[0].type, 'param');
  });
});