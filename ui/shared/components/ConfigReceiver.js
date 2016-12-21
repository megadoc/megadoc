const React = require('react');
const { pick } = require('lodash');
const { PropTypes } = React;
const ConfigReceiver = (Component, schema) => {
  const keys = Object.keys(schema);

  return React.createClass({
    displayName: `ConfigReceiver(${Component.displayName})`,
    contextTypes: {
      config: PropTypes.shape(schema).isRequired,
    },

    render() {
      return (
        <Component config={pick(this.context.config, keys)} {...this.props} />
      );
    }
  });
};

module.exports = ConfigReceiver;
