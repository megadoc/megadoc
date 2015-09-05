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
module.exports = function(resources) {
  var indices = {};

  resources.forEach(function(resource) {
    indices[ resource.id ] = {
      type: 'yard-api',
      resourceId: resource.id
    };

    resource.endpoints.forEach(function(endpoint) {
      var linkPath = [ endpoint.controller, endpoint.name ].join('#');

      indices[linkPath] = {
        type: 'yard-api',
        resourceId: resource.id,
        endpointId: endpoint.id
      };
    });

    resource.objects.forEach(function(object) {
      var linkPath = [ object.controller, object.title ].join('::');

      indices[linkPath] = {
        type: 'yard-api',
        resourceId: resource.id,
        objectId: object.id
      };
    });
  });

  return indices;
};