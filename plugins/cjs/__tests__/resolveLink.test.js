var resolveLink = require('../resolveLink');
var indexEntities = require('../indexEntities');
var assert = require('assert');

describe('cjs::resolveLink', function() {
  var database = [
    {
      isModule: true,
      id: 'Core.Cache',
      name: 'Cache',
      ctx: {
        type: 'function'
      }
    },
    {
      id: 'Core.Cache#add',
      symbol: '#',
      name: 'add',
      ctx: {
        receiver: 'Core.Cache',
        type: 'method'
      },
    }
  ];

  var registry = indexEntities(database).reduce(function(hsh, index) {
    hsh[index.path] = index.context;
    return hsh;
  }, {});

  it('resolves ${NS}.${MODULE}', function() {
    var link = resolveLink('Core.Cache', database, registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache');
  });

  it('resolves ${MODULE}', function() {
    var link = resolveLink('Cache', database, registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache');
  });

  it('resolves ${NS}.${MODULE}${SYM}${ENTITY}', function() {
    var link = resolveLink('Core.Cache#add', database, registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache#add');
  });

  it('resolves ${MODULE}${SYM}${ENTITY}', function() {
    var link = resolveLink('Cache#add', database, registry);

    assert.ok(link);
    assert.equal(link.title, 'Cache#add');
  });

  context('Given a currentModuleId', function() {
    it('resolves ${SYM}${ENTITY}', function() {
      var link = resolveLink('#add', database, registry, 'Core.Cache');

      assert.ok(link);
    });

    it('strips ${MODULE} from title if it is the same module', function() {
      var link = resolveLink('Cache#add', database, registry, 'Core.Cache');
      assert.equal(link.title, '#add');
    });

    it('does not strip ${MODULE} from title if it is a different module', function() {
      var link = resolveLink('Cache#add', database, registry, 'Something');
      assert.equal(link.title, 'Cache#add');
    });
  });
});