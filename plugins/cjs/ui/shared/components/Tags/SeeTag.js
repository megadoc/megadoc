var React = require("react");
var MarkdownText = require('components/MarkdownText');

var SeeTag = React.createClass({
  displayName: "SeeTag",

  propTypes: {
    string: React.PropTypes.string
  },

  render() {
    return (
      <p className="see-tag">
        See also: <MarkdownText tagName="span">{this.props.string}</MarkdownText>
      </p>
    );
  }
});

module.exports = SeeTag;