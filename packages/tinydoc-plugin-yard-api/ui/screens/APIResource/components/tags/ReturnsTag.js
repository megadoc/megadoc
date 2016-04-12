var React = require("react");

var ReturnsTag = React.createClass({
  propTypes: {
    text: React.PropTypes.string,
  },

  render() {
    return (
      <p>
        Returns {this.props.text}
      </p>
    );
  }
});

module.exports = ReturnsTag;