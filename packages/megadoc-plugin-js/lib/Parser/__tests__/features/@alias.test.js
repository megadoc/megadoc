var assert = require('chai').assert;
var TestUtils = require('../../TestUtils');

describe('CJS::Parser - @alias support', function() {
  it('accepts the alias', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * @module
      //  * @alias Foo
      //  */
      // var DragonHunter = {};
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].name, 'DragonHunter');
    assert.include(docs[0].aliases, 'Foo');
  });

  it('rewrites @memberOf that points to an alias', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * @module
      //  * @alias Foo
      //  */
      // var DragonHunter = {};
      //
      // /**
      //  * @memberOf Foo
      //  */
      // var something = '5';
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].name, 'something');
    assert.equal(docs[1].receiver, 'DragonHunter');
  });

  it.skip('rewrites @memberOf thats point to an alias that @lends to the void', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * @module
      //  */
      // var TheVoid;
      //
      // /**
      //  * @module
      //  * @lends TheVoid
      //  * @alias Foo
      //  */
      // var DragonHunter = {};
      //
      // /**
      //  * @memberOf Foo
      //  */
      // var something = '5';
    });

    console.log(docs)

    assert.equal(docs.length, 2);
    assert.equal(docs[1].name, 'something');
    assert.equal(docs[1].receiver, 'TheVoid');
  });

});
