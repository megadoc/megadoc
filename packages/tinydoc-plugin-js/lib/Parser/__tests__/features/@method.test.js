var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');

var parseInline = TestUtils.parseInline;

describe('CJS::Parser - @method tag', function() {
  it('it accepts a dynamically generated method', function() {
    var docs = parseInline(function() {;
      // /** @module */
      //  function Compiler() {
      //
      //    /**
      //     * @method on
      //     *
      //     * @param {String} event
      //     *        The event to bind to.
      //     */
      //    EventEmitter.call(this);
      //  }
    });

    assert.equal(docs.length, 2);
    var doc = docs.filter(function(x) { return x.name === 'on' })[0];

    assert.ok(doc);
    assert.equal(doc.id, 'Compiler#on');
    assert.equal(doc.receiver, 'Compiler');
    assert.equal(doc.ctx.type, K.TYPE_FUNCTION);
  });

  it('it accepts multiple dynamically generated methods in the same docstring', function() {
    var docs = parseInline(function() {;
      // /** @module */
      //  function Compiler() {
      //
      //    /**
      //     * @method on
      //     *
      //     * @param {String} event
      //     *        The event to bind to.
      //     * @param {Function} callback
      //     */
      //
      //    /**
      //     * @method off
      //     *
      //     * @param {String} event
      //     * @param {Function} callback
      //     */
      //    EventEmitter.call(this);
      //  }
    });

    assert.equal(docs.length, 3);
    assert.deepEqual(docs.map(function(d) { return d.id; }).sort(), [
      'Compiler', 'Compiler#off', 'Compiler#on'
    ]);
  });
});