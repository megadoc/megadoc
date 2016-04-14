const React = require('react');
const { RouteHandler } = require('react-router');

module.exports = function(config) {
  const { routeName } = config;

  return {
    match: props => props.path.match(`^/${routeName}`),
    component: React.createClass({
      displayName: `JSContent:${routeName}`,
      render: () => <RouteHandler routeName={routeName}  />
    }),
  };
};