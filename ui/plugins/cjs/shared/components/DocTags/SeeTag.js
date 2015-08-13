var React = require("react");
var MarkdownText = require('components/MarkdownText');

var SeeTag = React.createClass({
  displayName: "SeeTag",

  statics: {
    getKey: function(tag) {
      return tag.string;
    }
  },

  render() {
    return (
      <MarkdownText className="see-tag">
        {`See also: [${this.props.string}]().`}
      </MarkdownText>
    );
  }
});

module.exports = SeeTag;