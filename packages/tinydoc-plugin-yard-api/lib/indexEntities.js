var ROOT_NS = 'API';
var NS_SEP = '::';

/**
 * @memberOf YARDAPIPlugin
 * @method indexEntities
 *
 * Generate link indices for the available API resources, their endpoints, and
 * their objects.
 *
 * An index looks like this:
 *
 *     {
 *       type: "yard-api",
 *
 *       // Always present
 *       resourceId: "",
 *
 *       endpointId: null,
 *       objectId: null
 *     }
 */
module.exports = function(resources, registry) {
  resources.forEach(function(resource) {
    registry.add(resource.id, {
      type: 'yard-api',
      resourceId: resource.id
    });

    resource.endpoints.forEach(function(endpoint) {
      var linkPath = [ endpoint.controller, endpoint.name ].join('#');

      registry.add(linkPath, {
        type: 'yard-api',
        resourceId: resource.id,
        endpointId: endpoint.id
      });
    });

    resource.objects.forEach(function(object) {
      var index = {
        type: 'yard-api',
        resourceId: resource.id,
        objectId: object.id
      };

      registry.add([ object.controller, object.title ].join(NS_SEP), index);
      registry.add([ ROOT_NS,           object.title ].join(NS_SEP), index)
    });
  });
};