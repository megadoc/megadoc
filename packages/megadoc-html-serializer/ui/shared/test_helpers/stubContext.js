const React = require('react');
const { func } = React.PropTypes;
const sinon = require('sinon');

module.exports = function(Component, fn) {
  return React.createClass({
    childContextTypes: {
      location: require('schemas/Location'),
      navigate: func,
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