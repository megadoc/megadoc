var LinkResolver = require('../../../../tinydoc/lib/LinkResolver');
var indexEntities = require('../indexEntities');
var assert = require('assert');

describe('yard-api::indexEntities', function() {
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

  var resolver = new LinkResolver(indexEntities(database));

  resolver.use(function(id, registry) {
    var index = registry[id];

    if (index) {
      var href;

      if (index.objectId) {
        href = index.resourceId + '::' + index.objectId;
      }
      else if (index.endpointId) {
        href = index.resourceId + '#' + index.endpointId;
      }
      else {
        href = index.resourceId;
      }

      return {
        href: href,
        title: 'foobar'
      };
    }
  });

  it('indexes & resolves an API resource', function() {
    assert.equal(
      resolver.linkify('[api_users]()'),
      '[foobar](tiny://api_users)'
    );
  });

  it('indexes & resolves an API resource endpoint', function() {
    assert.equal(
      resolver.linkify('[Api::Admin::UsersController#create]()'),
      '[foobar](tiny://api_users#api_admin_users_controller_create)'
    );
  });

  it('indexes & resolves an API resource object', function() {
    assert.equal(
      resolver.linkify('[Api::Admin::UsersController::UserRequest]()'),
      '[foobar](tiny://api_users::api_admin_users_controller_user_request)'
    );
  });
});
