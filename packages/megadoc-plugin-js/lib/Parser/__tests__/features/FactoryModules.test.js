var assert = require('assert');
var TestUtils = require('../../TestUtils');
var K = require('../../constants');
var findWhere = require('lodash').findWhere;
var parseInline = TestUtils.parseInline;

describe('CJS::Parser - Factory modules', function() {
  it('parses methods in a literal return object', function() {
    var doc;
    var docs = parseInline(function() {;
      // /**
      //  * Let there be dragons.
      //  */
      // var DragonHunter = function() {
      //   return {
      //     /**
      //      * Do something.
      //      */
      //     someMethod: function() {
      //     }
      //   };
      // };
      //
      // module.exports = DragonHunter;
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'DragonHunter#someMethod' });

    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
  });

  it('parses properties in a literal return object', function() {
    var doc;
    var docs = parseInline(function() {;
      // /** @module */
      // var DragonHunter = function() {
      //   return {
      //     /**
      //      * Do something.
      //      */
      //     someProp: 'a'
      //   };
      // };
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'DragonHunter@someProp' });

    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_LITERAL);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
  });

  it('parses entities in a locally-scoped returned object', function() {
    var doc;
    var docs = parseInline(function() {;
      // /** Let there be dragons. */
      // function DragonHunter() {
      //   let api = {};
      //
      //   /** Do something. */
      //   api.someMethod = function() {
      //   };
      //
      //   /** Adooken. */
      //   api.someProp = 'a';
      //
      //   return api;
      // }
      //
      // module.exports = DragonHunter;
    });

    assert.equal(docs.length, 3);

    doc = findWhere(docs, { id: 'DragonHunter#someMethod' });

    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);

    doc = findWhere(docs, { id: 'DragonHunter@someProp' });

    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_LITERAL);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
  });

  it('parse static methods & properties', function() {
    var doc;
    var docs = parseInline(function() {;
      // /** @module */
      // var DragonHunter = function() {
      //   return {
      //     /** Something */
      //     someProp: 'a',
      //
      //     /** Do something. */
      //     someMethod: function() {}
      //   };
      // };
      //
      // /** Do something */
      // DragonHunter.someStaticMethod = function() {};
      //
      // /** Something */
      // DragonHunter.SOME_STATIC_PROP = 'a'
    });

    assert.equal(docs.length, 5);

    doc = findWhere(docs, { id: 'DragonHunter#someMethod' });
    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);

    doc = findWhere(docs, { id: 'DragonHunter@someProp' });
    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_LITERAL);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);

    doc = findWhere(docs, { id: 'DragonHunter.someStaticMethod' });
    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, undefined);

    doc = findWhere(docs, { id: 'DragonHunter.SOME_STATIC_PROP' });
    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_LITERAL);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, undefined);
  });

  it('works with a named function returned in a return literal', function() {
    var doc;
    var docs = parseInline(function() {;
      // /**
      //  * Let there be dragons.
      //  */
      // var DragonHunter = function() {
      //   /** capture a dragon */
      //   return function capture() {};
      // };
      //
      // module.exports = DragonHunter;
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'DragonHunter#capture' });

    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
  });

  it('works with an anonymous function returned in a return literal', function() {
    var doc;
    var docs = parseInline(function() {;
      // /** Let there be dragons. */
      // var DragonHunter = function() {
      //   /** capture a dragon */
      //   return function() {};
      // };
      //
      // module.exports = DragonHunter;
    });

    assert.equal(docs.length, 2);

    doc = findWhere(docs, { id: 'DragonHunter#' + K.DEFAULT_FACTORY_EXPORTS_ID });

    assert.ok(doc);
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.receiver, 'DragonHunter');
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
  });

  it('works with an anonymous factory assigned to module.exports', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * A bunch of utilities for dealing with asset files.
      //  */
      // module.exports = function(config) {
      //   return {
      //     /**
      //      * Convert a relative asset path into an absolute path.
      //      */
      //     getAssetPath: function(relativePath) {
      //     }
      //   };
      // };
    }, { inferModuleIdFromFileName: true }, 'FactoryModule.js');

    assert.equal(docs.length, 2);

    assert.equal(docs[0].id, 'FactoryModule');

    assert.equal(docs[1].id, 'FactoryModule#getAssetPath');
    assert.equal(docs[1].receiver, 'FactoryModule');
    assert.equal(docs[1].typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(docs[1].ctx.scope, K.SCOPE_FACTORY_EXPORTS);
  });

  it('works with a namespaced factory', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * @module
      //  * @namespace Core
      //  */
      // var EventEmitter = function() {
      //   return {
      //     /** Emit a change */
      //     emitChange() {}
      //   };
      // };
      //
      // /** Throttle a given EventEmitter. */
      // EventEmitter.throttleEmitter = function(emitter, threshold) {
      // };
    });

    var doc;

    assert.equal(docs.length, 3);

    doc = findWhere(docs, { id: 'Core.EventEmitter#emitChange' });
    assert.equal(doc.ctx.scope, K.SCOPE_FACTORY_EXPORTS);
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.receiver, 'Core.EventEmitter');

    doc = findWhere(docs, { id: 'Core.EventEmitter.throttleEmitter' });
    assert.equal(doc.typeInfo.name, K.TYPE_FUNCTION);
    assert.equal(doc.ctx.scope, K.SCOPE_UNSCOPED);
    assert.equal(doc.receiver, 'Core.EventEmitter');
  });
});