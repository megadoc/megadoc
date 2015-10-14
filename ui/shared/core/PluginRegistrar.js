const buildRouteMap = require('utils/buildRouteMap');
const OutletManager = require('core/OutletManager');

module.exports = function(emitter) {
  var routeSpecs = [];

  return {
    getPluginRouteMap: function() {
      return buildRouteMap(routeSpecs);
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

      registerOutletElement: function(outlet, renderer) {
        OutletManager.add(outlet, renderer);
      }
    }
  };
};