var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');

describe('CJS::Parser - @mixes support', function() {
  it('correctly adjusts the receiver to the specified one', function() {
    var docs = TestUtils.parseInline(function() {;
      // /** @module */
      // var Node = {}
      //
      // /**
      //  * @module
      //  * @mixes Node
      //  *
      //  * Hello baby.
      //  */
      // function Document() {}
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(docs[1].name, 'Document');
    assert.equal(docs[1].receiver, undefined);
    assert.equal(docs[1].description, 'Hello baby.', 'It grabs the rest of the docstring from @mixes');
    assert.deepEqual(docs[1].mixinTargets, [ 'Node' ]);
  });
});