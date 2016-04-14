const React = require('react');
const { RouteHandler } = require('react-router');

module.exports = function createRoot(routeName) {
  return React.createClass({
    displayName: 'JSRoot',
    render() {
      return (
        <RouteHandler routeName={routeName}  />
      );
    }
  });
};