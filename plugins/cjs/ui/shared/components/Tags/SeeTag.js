var React = require("react");
var MarkdownText = require('components/MarkdownText');

var SeeTag = React.createClass({
  displayName: "SeeTag",

  propTypes: {
    string: React.PropTypes.string
  },

  render() {
    return (
      <MarkdownText className="see-tag">
        {`See also: [${this.props.string.trim()}]().`}
      </MarkdownText>
    );
  }
});

module.exports = SeeTag;