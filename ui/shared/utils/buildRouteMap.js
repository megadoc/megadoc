var React = require('react');
var { Route, DefaultRoute, Redirect } = require("react-router");
var { omit, findWhere } = require('lodash');

module.exports = function(specs) {
  specs.forEach(function(spec) {
    if (!spec.children) { spec.children = []; }
  });

  // attach children to parent routes
  specs
    .filter(function(spec) {
      return spec.parent;
    })
    .forEach(function(spec) {
      var parentSpec = findWhere(specs, { name: spec.parent });

      if (!parentSpec) { // are they KIDDING????
        throw new Error(`Unable to find parent route '${spec.parent}' for route '${spec.name}'`);
      }
      else {
        parentSpec.children.push(spec);
      }
    })
  ;

  return specs
    // discard child routes from the root
    .filter(function(spec) {
      return !spec.parent;
    })
    .map(function createRoute(spec) {
      var Type;

      if ([Route, Redirect].indexOf(spec.type) > -1) {
        return spec;
      }
      else {
        if (spec.children) {
          spec.children = spec.children.map(createRoute);
        }

        if (spec.default) {
          Type = DefaultRoute;
          spec = omit(spec, [ "children", "default", "path" ]);
        }
        else {
          Type = Route;
        }

        return <Type key={spec.name} {...spec} />;
      }
    })
  ;
};