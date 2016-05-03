var LinkResolver = require('tinydoc/lib/HTMLSerializer__LinkResolver');
var Registry = require('tinydoc/lib/Registry');
var indexEntities = require('../indexEntities');
var assert = require('assert');
var Corpus = require('tinydoc-corpus').Corpus;

describe('yard-api::indexEntities', function() {
  var registry = new Registry();
  var database = [{
    id: 'api_users',
    endpoints: [{
      controller: 'Api::Admin::UsersController',
      name: 'create',
      id: 'api_admin_users_controller_create'
    }],
    objects: [{
      controller: 'Api::Admin::UsersController',
      title: 'UserRequest',
      id: 'api_admin_users_controller_user_request'
    }]
  }];

  var resolver = new LinkResolver(indexEntities(database, registry, { routeName: 'api' }), Corpus());

  resolver.use(function(id) {
    var index = registry.toJSON().indices[id];

    if (index) {
      var href;

      if (index.objectId) {
        href = '/' + index.resourceId + '::' + index.objectId;
      }
      else if (index.endpointId) {
        href = '/' + index.resourceId + '#' + index.endpointId;
      }
      else {
        href = '/' + index.resourceId;
      }

      return {
        href: href,
        title: 'foobar'
      };
    }
  });

  it('indexes & resolves an API resource', function() {
    assert.ok(resolver.lookup('api_users'));
  });

  it('indexes & resolves an API resource endpoint', function() {
    assert.ok(resolver.lookup('Api::Admin::UsersController#create'));
  });

  it('indexes & resolves an API resource object', function() {
    assert.ok(resolver.lookup('Api::Admin::UsersController::UserRequest'));
  });
});
