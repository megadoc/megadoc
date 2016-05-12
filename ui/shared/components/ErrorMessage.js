const React = require('react');
const ErrorMessage = React.createClass({
  render() {
    return (
      <div className="error-message" {...this.props} />
    );
  }
});

module.exports = ErrorMessage;
