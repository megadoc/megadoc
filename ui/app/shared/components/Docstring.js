var React = require("react");
var MarkdownText = require('components/MarkdownText');

var Docstring = React.createClass({
  propTypes: {
    children: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.arrayOf(React.PropTypes.string)
    ])
  },

  render() {
    var text = this.props.children;

    if (Array.isArray(text)) {
      text = this.props.children.join(' ');
    }

    return (
      <MarkdownText {...this.props} children={text} />
    );
  }
});

module.exports = Docstring;