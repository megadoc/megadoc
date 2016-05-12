const React = require("react");
const MarkdownText = require('components/MarkdownText');
const { string, bool, } = React.PropTypes;

const ReturnsTag = React.createClass({
  propTypes: {
    text: string,
    codeBlock: bool,
  },

  render() {
    return (
      <p>
        Returns {(
          <MarkdownText tagName={this.props.codeBlock ? "pre" : 'span'}>
            {this.props.text.trim()}
          </MarkdownText>
        )}
      </p>
    );
  }
});

module.exports = ReturnsTag;