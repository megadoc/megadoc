var assert = require('assert');
var TestUtils = require('../../TestUtils');
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - CommonJS automatic module identification', function() {
  it('var SomeModule = function() {}; module.exports = SomeModule;', function() {
    var docs = parseInline(function() {
      // /**
      //  * Description of the module.
      //  *
      //  * @param {String[]} allowedEvents
      //  *        A list of event names that are allowed to be emitted by this object.
      //  */
      // var EventEmitter = function(allowedEvents) {
      // };
      // module.exports = EventEmitter;
    });

    assert.equal(docs.length, 1);
    assert.ok(docs[0].isModule, 'it marks the doc as module');
  });

  it('function SomeModule() {}; module.exports = SomeModule;', function() {
    var docs = parseInline(function() {
      // /**
      //  * Description of the module.
      //  *
      //  * @param {String[]} allowedEvents
      //  *        A list of event names that are allowed to be emitted by this object.
      //  */
      // function EventEmitter(allowedEvents) {
      // }
      //
      // module.exports = EventEmitter;
    });

    assert.equal(docs.length, 1);
    assert.ok(docs[0].isModule, 'it marks the doc as module');
  });

  it('module.exports = function SomeModule() {};', function() {
    var docs = parseInline(function() {
      // /**
      //  * Description of the module.
      //  *
      //  * @param {String[]} allowedEvents
      //  *        A list of event names that are allowed to be emitted by this object.
      //  */
      // module.exports = function EventEmitter(allowedEvents) {
      // };
    });

    assert.equal(docs.length, 1);
    assert.ok(docs[0].isModule, 'it marks the doc as module');
  });

  it('var SomeModule = exports;', function() {
    var docs = parseInline(function() {
      // /**
      //  * Let there be dragons.
      //  */
      // var DragonHunter = exports;
      //
      // DragonHunter.capture = function() {
      // };
    });

    assert.equal(docs.length, 1);
    assert.ok(docs[0].isModule, 'it marks the doc as module');
  });

  it('var SomeModule = exports; exports.something = something;', function() {
    var docs = parseInline(function() {
      // /**
      //  * Let there be dragons.
      //  */
      // let DragonHunter = exports;
      //
      // /**
      //  * @memberOf DragonHunter
      //  * Capture a dragon!
      //  */
      // function capture() {
      // }
      //
      // exports.capture = capture;
    });

    assert.equal(docs.length, 2);
    assert.ok(docs[1].receiver, 'DragonHunter');
  });

  it('module.exports = {};', function() {
    var docs = parseInline(function() {
      // /**
      //  * @module SomeModule
      //  * Let there be dragons.
      //  */
      // module.exports = {
      // };
    });

    assert.equal(docs.length, 1);
    assert.ok(docs[0].isModule, 'it marks the doc as module');
  });

  it('@module should override function name', function() {
    var docs = parseInline(function() {
      // /**
      //  * @module OverriddenName
      //  *
      //  * Description of the module.
      //  *
      //  * @param {String[]} allowedEvents
      //  *        A list of event names that are allowed to be emitted by this object.
      //  */
      // module.exports = function EventEmitter(allowedEvents) {
      // };
    });

    assert.equal(docs.length, 1);
    assert.ok(docs[0].isModule, 'it marks the doc as module');
    assert.equal(docs[0].id, 'OverriddenName');
  });
});