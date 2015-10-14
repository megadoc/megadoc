const React = require("react");

var MarkdownText = React.createClass({
  propTypes: {
    children: React.PropTypes.any,
    className: React.PropTypes.string,
    tagName: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      tagName: 'div'
    };
  },

  render() {
    const DOMTag = this.props.tagName;

    return (
      <DOMTag
        className={`markdown-text ${this.props.className || ''}`}
        dangerouslySetInnerHTML={{
          __html: this.props.children
        }}
      />
    );
  }
});

module.exports = MarkdownText;