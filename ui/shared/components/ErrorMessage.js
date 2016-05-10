const React = require('react');
const ErrorMessage = React.createClass({
  render() {
    return (
      <div className="error-message">
        {this.props.children}
      </div>
    );
  }
});

module.exports = ErrorMessage;
