const React = require('react');
const sinon = require('sinon');
const { PropTypes } = React;

module.exports = function stubRoutingContext(Component, fn) {
  return React.createClass({
    childContextTypes: {
      location: require('schemas/Location'),
      navigate: PropTypes.func,
    },

    getChildContext() {
      const overrides = typeof fn === 'function' ? fn() : fn;

      return overrides || {
        location: window.location,
        navigate: sinon.stub()
      };
    },

    render() {
      return <Component {...this.props} />
    }
  });
};