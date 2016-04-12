var Subject = require("../Indexer");
var assert = require('chai').assert;
var TestUtils = require('../Parser/TestUtils');

describe("CJS::Indexer", function() {
  describe('.generateSearchTokens', function() {
    var database, registry, subject;

    beforeEach(function() {
      database = TestUtils.parseInline(function() {;
        // /**
        //  * @namespace Core
        //  * @module
        //  * @alias Foo
        //  * @alias Bar
        //  */
        // function Cache() {}
        //
        // /**
        //  * Add an item to the cache.
        //  */
        // Cache.prototype.add = function() {
        // };
      }, {}, '__test__/core/Cache.js');

      registry = TestUtils.buildRegistry(database, 'js-test');
      subject = Subject.generateSearchTokens(database, registry);
    });

    context('for modules', function() {
      it('it generates a token with the module FQN', function() {
        assert.include(subject[0], { $1: 'Core.Cache' });
      });

      it('it generates a token with the module file path', function() {
        assert.include(subject[0], { $2: '__test__/core/Cache.js' });
      });

      it('generates the proper link', function() {
        assert.include(subject[0].link, {
          href: '/js-test/modules/Core.Cache'
        });
      });
    });

    context('for aliased modules', function() {
      it('it generates a token with the first alias', function() {
        assert.include(subject[0], { $3: 'Foo' });
      });
    });

    context('for entities', function() {
      it('uses the entity FQN (with namespace and symbol)', function() {
        assert.include(subject[1], { $1: 'Core.Cache#add' });
      });

      it('generates the proper link', function() {
        assert.include(subject[1].link, {
          href: '/js-test/modules/Core.Cache/%23add'
        });
      });
    });
  });
});