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
      var linkPath = [ object.controller, object.title ].join('::');

      registry.add(linkPath, {
        type: 'yard-api',
        resourceId: resource.id,
        objectId: object.id
      });
    });
  });
};