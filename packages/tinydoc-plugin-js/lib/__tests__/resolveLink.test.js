var resolveLink = require('../resolveLink');
var indexEntities = require('../indexEntities');
var assert = require('assert');
var TestUtils = require('../Parser/TestUtils');

describe('cjs::resolveLink', function() {
  var database, registry;

  before(function() {
    database = TestUtils.parseInline(function() {
      // /**
      //  * @namespace Core
      //  * @module
      //  */
      // function Cache() {}
      //
      // /**
      //  * Add an item to the cache.
      //  */
      // Cache.prototype.add = function() {
      // };
    });

    database.__meta__ = { routeName: '' };

    registry = {
      get: function(id) {
        return registry.entries[id];
      },

      entries: indexEntities(database).reduce(function(hsh, index) {
        hsh[index.path] = index.index;
        return hsh;
      }, {})
    };
  });

  it('resolves ${NS}.${MODULE}', function() {
    var link = resolveLink(database, 'Core.Cache', registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache');
  });

  it('resolves ${MODULE}', function() {
    var link = resolveLink(database, 'Cache', registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache');
  });

  it('resolves ${NS}.${MODULE}${SYM}${ENTITY}', function() {
    var link = resolveLink(database, 'Core.Cache#add', registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache#add');
  });

  it('resolves ${MODULE}${SYM}${ENTITY}', function() {
    var link = resolveLink(database, 'Cache#add', registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache#add');
  });

  context('Given a currentModuleId', function() {
    it('resolves ${SYM}${ENTITY}', function() {
      var link = resolveLink(database, '#add', registry, 'Core.Cache');

      assert.ok(link);
    });

    it('strips ${MODULE} from title if it is the same module', function() {
      var link = resolveLink(database, 'Cache#add', registry, 'Core.Cache');
      assert.equal(link.title, '#add');
    });

    it('does not strip ${MODULE} from title if it is a different module', function() {
      var link = resolveLink(database, 'Cache#add', registry, 'Something');
      assert.equal(link.title, 'Cache#add');
    });
  });
});