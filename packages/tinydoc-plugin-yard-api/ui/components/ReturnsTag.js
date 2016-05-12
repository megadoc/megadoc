const React = require("react");
const MarkdownText = require('components/MarkdownText');

const ReturnsTag = React.createClass({
  propTypes: {
    text: React.PropTypes.string,
  },

  render() {
    return (
      <p>
        Returns <MarkdownText tagName="span">{this.props.types.join(' | ')}</MarkdownText>
      </p>
    );
  }
});

module.exports = ReturnsTag;