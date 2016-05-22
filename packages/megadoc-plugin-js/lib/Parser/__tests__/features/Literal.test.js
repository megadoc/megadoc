var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - Literal nodes annotated with comments', function() {
  it('works using @method', function() {
    var docs = parseInline(function() {;
      // /**
      //  * @module sinonSuite
      //  */
      // function sinonSuite() {
      //   var properties = [
      //     /**
      //      * @method spy
      //      *
      //      * @param {Object} target
      //      * @param {String} methodName
      //      *
      //      * Install a spy on a target.
      //      */
      //     "spy",
      //   ];
      //
      //   properties.forEach(function(prop) { this[prop] = proxy(prop); }.bind(this));
      // }
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[0].type, K.TYPE_FUNCTION);

    assert.equal(docs[1].name, 'spy');
    assert.equal(docs[1].receiver, 'sinonSuite');
    assert.equal(docs[1].type, K.TYPE_FUNCTION);
  });

  it('works as a @property', function() {
    var docs = parseInline(function() {;
      // /**
      //  * @module sinonSuite
      //  */
      // function sinonSuite() {
      //   var properties = [
      //     /**
      //      * @property {Function} spy
      //      *
      //      * @param {Object} target
      //      * @param {String} methodName
      //      *
      //      * Install a spy on a target.
      //      */
      //     "spy",
      //   ];
      //
      //   properties.forEach(function(prop) { this[prop] = proxy(prop); }.bind(this));
      // }
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[0].type, K.TYPE_FUNCTION);

    assert.equal(docs[1].name, 'spy');
    assert.equal(docs[1].receiver, 'sinonSuite');
    assert.equal(docs[1].nodeInfo.scope, K.SCOPE_FACTORY_EXPORTS);
    assert.equal(docs[1].type, K.TYPE_FUNCTION);
    assert.equal(docs[1].symbol, '#');
  });

  it('works as a @memberOf an object using @name to name it', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // var x = {};
      //
      // var properties = [
      //   /**
      //    * @memberOf x
      //    * @name spy
      //    */
      //   "spy",
      // ];
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[0].type, K.TYPE_OBJECT);

    assert.equal(docs[1].name, 'spy');
    assert.equal(docs[1].receiver, 'x');
    assert.equal(docs[1].nodeInfo.scope, K.SCOPE_UNSCOPED);
    assert.equal(docs[1].type, K.TYPE_UNKNOWN);
    assert.equal(docs[1].symbol, '.');
  });

  it('works as a @memberOf an object using @name to name it and @type to specify it', function() {
    var docs = parseInline(function() {;
      // /** @module */
      // var x = {};
      //
      // var properties = [
      //   /**
      //    * @memberOf x
      //    * @name spy
      //    * @type {Function}
      //    */
      //   "spy",
      // ];
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[0].type, K.TYPE_OBJECT);

    assert.equal(docs[1].name, 'spy');
    assert.equal(docs[1].receiver, 'x');
    assert.equal(docs[1].nodeInfo.scope, K.SCOPE_UNSCOPED);
    assert.equal(docs[1].type, K.TYPE_FUNCTION);
    assert.equal(docs[1].symbol, '.');
  });
});
