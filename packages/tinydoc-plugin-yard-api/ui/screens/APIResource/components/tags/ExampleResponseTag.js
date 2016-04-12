var React = require("react");
var HighlightedText = require('components/HighlightedText');

var ExampleResponseTag = React.createClass({
  propTypes: {
    text: React.PropTypes.string
  },

  render() {
    return (
      <div className="example-response-tag">
        <HighlightedText>{this.props.text}</HighlightedText>
      </div>
    );
  }
});

module.exports = ExampleResponseTag;