var React = require("react");
var MarkdownText = require('components/MarkdownText');

var SeeTag = React.createClass({
  displayName: "SeeTag",

  propTypes: {
    string: React.PropTypes.string
  },

  render() {
    return (
      <li className="see-tag">
        <MarkdownText tagName="span">{this.props.string}</MarkdownText>
      </li>
    );
  }
});

module.exports = SeeTag;