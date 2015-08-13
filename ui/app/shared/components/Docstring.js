var React = require("react");
var MarkdownText = require('components/MarkdownText');

var Docstring = React.createClass({
  displayName: "Docstring",

  render() {
    var text = this.props.children;

    if (Array.isArray(text)) {
      text = this.props.children.join(' ');
    }

    return(
      <MarkdownText {...this.props} children={text} />
    );
  }
});

module.exports = Docstring;