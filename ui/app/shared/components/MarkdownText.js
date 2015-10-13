const React = require("react");

var MarkdownText = React.createClass({
  propTypes: {
    children: React.PropTypes.any,
    className: React.PropTypes.string,
  },

  render() {
    return (
      <div
        className={`markdown-text ${this.props.className || ''}`}
        dangerouslySetInnerHTML={{
          __html: this.props.children
        }}
      />
    );
  }
});

module.exports = MarkdownText;