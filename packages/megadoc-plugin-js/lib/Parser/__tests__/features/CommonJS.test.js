var assert = require('chai').assert;
var TestUtils = require('../../TestUtils');
var parseInline = TestUtils.parseInline;
var MegaTestUtils = require('megadoc/lib/TestUtils');

describe('CJS::Parser - CommonJS automatic module identification', function() {
  it('var SomeModule = function() {}; module.exports = SomeModule;', function() {
    var docs = parseInline(function() {;
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
    var docs = parseInline(function() {;
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
    var docs = parseInline(function() {;
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
    var docs = parseInline(function() {;
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

  it('var SomeModule = exports; variant 2', function() {
    var docs = parseInline(function() {;
      // /**
      //  * Let there be dragons.
      //  */
      // var DragonHunter = exports;
      //
      // /** hello */
      // exports.capture = function() {
      // };
    });

    assert.equal(docs.length, 2);
    assert.ok(docs[0].isModule, 'it marks the doc as module');
    assert.ok(docs[1].id, 'capture');
    assert.ok(docs[1].receiver, 'DragonHunter');
  });

  it('var SomeModule = exports; exports.something = something;', function() {
    var docs = parseInline(function() {;
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
    var docs = parseInline(function() {;
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
    var docs = parseInline(function() {;
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

  // man this was a crazy bug xD
  context('when an identifier exists in two files, and is exported in one of them...', function() {
    var docs, file1, file2;
    var suite = MegaTestUtils.IntegrationSuite(this);

    beforeEach(function() {
      file1 = suite.createFile('a.js', function() {;
        // /** A module */
        // function Corpus() {
        //   var exports = {};
        //
        //   /** Teehee! */
        //   exports.resolve = function() {}
        //
        //   return exports;
        // }
        //
        // module.exports = Corpus;
      });

      file2 = suite.createFile('b.js', function() {;
        // function resolve() {}
        //
        // module.exports = resolve;
      });

      docs = TestUtils.parseFiles([ file1.path, file2.path ], {});

      assert.equal(docs.length, 2);
    });

    it('does not confuse them', function() {
      assert.include(docs[0], { id: 'Corpus', isModule: true });
      assert.include(docs[1], { id: 'Corpus#resolve', isModule: false });
    });
  });

  // shoot me
  context('when an identifier exists in two files, is a module in one but not the other, and is exported in one of them...', function() {
    var docs, file1, file2;
    var suite = MegaTestUtils.IntegrationSuite(this);

    beforeEach(function() {
      file1 = suite.createFile('a.js', function() {;
        // /** A module */
        // function Corpus() {
        //   var exports = {};
        //
        //   /** Teehee! */
        //   exports.resolve = function() {}
        //
        //   return exports;
        // }
        //
        // module.exports = Corpus;
      });

      file2 = suite.createFile('b.js', function() {;
        // /** Foo */
        // function resolve() {}
        //
        // module.exports = resolve;
      });

      docs = TestUtils.parseFiles([ file1.path, file2.path ], {});

      assert.equal(docs.length, 3);
    });

    it('does not confuse them', function() {
      assert.include(docs[0], { id: 'Corpus', isModule: true });
      assert.include(docs[1], { id: 'Corpus#resolve', isModule: false });
      assert.include(docs[2], { id: 'resolve', isModule: true });
    });
  });
});