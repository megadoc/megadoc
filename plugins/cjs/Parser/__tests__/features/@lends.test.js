var assert = require('assert');
var TestUtils = require('../../TestUtils');
var findWhere = require('lodash').findWhere;

describe('CJS::Parser - @lends support', function() {
  it('redirects all entities belonging to a @lends object into the specified receiver', function() {
    var docs = TestUtils.parseInline(function() {
      // /**
      //  * Adooken.
      //  */
      // let DOMHelpers = exports;
      //
      // /**
      //  * @lends DOMHelpers
      //  */
      // var helpers = {};
      //
      // /** Locate an element inside the component. */
      // helpers.findAll = function(selector, options = {}) {
      // };
      //
      // /** Locate an element inside the component. */
      // helpers.find = function(selector, options) {
      // };
    });

    function get(id, asserts) {
      var doc = findWhere(docs, { id: id });
      assert.ok(doc);
      asserts(doc);
    }

    assert.equal(docs.length, 3);

    get('DOMHelpers', function(doc) {
      assert.equal(doc.isModule, true);
      assert.equal(doc.ctx.type, 'object');
    });

    get('findAll', function(doc) {
      assert.equal(doc.receiver, 'DOMHelpers');
    });

    get('find', function(doc) {
      assert.equal(doc.receiver, 'DOMHelpers');
    });
  });

  it('correctly links entities defined using something like assign()', function() {
    var docs = TestUtils.parseInline(function() {
      // /** @module */
      // var DragonHunter = {};
      //
      // /** @lends DragonHunter */
      // assign(DragonHunter, {
      //  /**
      //   * Adooken.
      //   */
      //   someProperty: 'a'
      // });
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].ctx.type, 'literal');
    assert.equal(docs[1].name, 'someProperty');
    assert.equal(docs[1].receiver, 'DragonHunter');
    assert.equal(docs[1].ctx.value, 'a');
  });

  it('correctly resolves a namespaced module', function() {
    var docs = TestUtils.parseInline(function() {
      // /**
      //  * @namespace API
      //  * @module
      //  */
      // var DragonHunter = {};
      //
      // /** @lends DragonHunter */
      // assign(DragonHunter, {
      //  /**
      //   * Adooken.
      //   */
      //   someProperty: 'a'
      // });
    });

    assert.equal(docs.length, 2);
    assert.equal(docs[1].ctx.type, 'literal');
    assert.equal(docs[1].name, 'someProperty');
    assert.equal(docs[1].receiver, 'API.DragonHunter');
    assert.equal(docs[1].ctx.value, 'a');
  });
});
