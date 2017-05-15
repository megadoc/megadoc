var React = require("react");
var HighlightedText = require('components/HighlightedText');

var ExampleRequestTag = React.createClass({
  propTypes: {
    text: React.PropTypes.string
  },

  render() {
    return (
      <div className="example-request-tag">
        <HighlightedText>{this.props.text}</HighlightedText>
      </div>
    );
  }
});

module.exports = ExampleRequestTag;