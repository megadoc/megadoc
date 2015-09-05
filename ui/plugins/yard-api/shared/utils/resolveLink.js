const Database = require('core/Database');
const Router = require('core/Router');
const { findWhere } = require('lodash');

module.exports = function(id, registry) {
  const index = registry[id];

  if (index && index.type === 'yard-api') {
    const resource = Database.getCodeObject(index.resourceId);

    console.assert(!!resource,
      `Expected to find a YARD-API resource called '${index.resourceId}'`
    );

    let params = { resourceId: resource.id };
    let queryParams = {};
    let title;

    if (index.endpointId) {
      const endpoint = findWhere(resource.endpoints, { id: index.endpointId });

      console.assert(!!endpoint,
        `Expected to find a YARD-API endpoint called '${index.endpointId}' inside '${index.resourceId}'`
      );

      queryParams.endpoint = endpoint.scoped_id;
      title = [ resource.title, endpoint.title ].join(':');
    }
    else if (index.objectId) {
      const object = findWhere(resource.objects, { id: index.objectId });

      console.assert(!!object,
        `Expected to find a YARD-API object called '${index.objectId}' inside '${index.resourceId}'`
      );

      queryParams.object = object.scoped_id;
      title = [ resource.title, object.title ].join(':');
    }
    else {
      title = resource.title;
    }

    return {
      href: Router.makeHref(`api.resource`, params, queryParams),
      title
    };
  }
};
