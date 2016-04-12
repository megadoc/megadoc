var assert = require('assert');
var findWhere = function(set, k, v) {
  return set.filter(function(item) {
    return item[k] === v;
  })[0];
};

module.exports = function(routeName, database, id, registry) {
  var index = registry.get(id);

  if (index && index.type === 'yard-api') {
    var baseURL, endpoint, object;
    var resource = findWhere(database, 'id', index.resourceId);

    assert(!!resource,
      "Expected to find a YARD-API resource called '" + index.resourceId + "'"
    );

    baseURL = routeName + '/resources/' + resource.id;

    if (index.endpointId) {
      endpoint = findWhere(resource.endpoints, 'id', index.endpointId);

      assert(!!endpoint,
        "Expected to find a YARD-API endpoint called " +
        "'" + index.endpointId + "' inside '" + index.resourceId + "'"
      );

      return {
        href: [ baseURL, 'endpoints', endpoint.scoped_id ].join('/'),
        title: [ resource.title, endpoint.title ].join(':'),
      };
    }
    else if (index.objectId) {
      object = findWhere(resource.objects, 'id', index.objectId);

      assert(!!object,
        "Expected to find a YARD-API object called " +
        "'" + index.objectId + "' inside '" + index.resourceId + "'"
      );

      return {
        href: [ baseURL, 'objects', object.scoped_id ].join('/'),
        title: [ resource.title, object.title ].join(':'),
      };
    }
    else {
      return {
        title: resource.title,
        href: baseURL
      };
    }
  }
};
