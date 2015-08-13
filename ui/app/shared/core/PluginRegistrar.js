var buildRouteMap = require('utils/buildRouteMap');

module.exports = function(emitter) {
  var routeSpecs = [];
  var outletElements = [];
  var linkableEntities = [];

  return {
    getPluginRouteMap: function() {
      return buildRouteMap(routeSpecs);
    },

    getOutletElements() {
      return outletElements;
    },

    getLinkableEntities() {
      return linkableEntities;
    },

    API: {
      on: function(event, callback) {
        return emitter.on(event, callback);
      },

      registerRoutes: function(specs) {
        specs.forEach(function(spec) {
          // todo: validate spec
          routeSpecs.push(spec);
        });
      },

      registerOutletElement: function(outlet, renderer, key) {
        outletElements.push({ outlet, renderer, key: key || renderer.key });
      }
    }
  };
};