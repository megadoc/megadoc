const React = require('react');
const DefaultValue = React.createClass({
  propTypes: {
    defaultValue: React.PropTypes.string,
  },

  render() {
    const { defaultValue } = this.props;

    if (!defaultValue) {
      return null;
    }

    return (
      <p className="property-tag__default-value">
        Defaults to: <code>{defaultValue}</code>
      </p>
    );
  }
});

module.exports = DefaultValue;
