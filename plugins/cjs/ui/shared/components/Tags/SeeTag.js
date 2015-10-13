var React = require("react");
var MarkdownText = require('components/MarkdownText');

var SeeTag = React.createClass({
  displayName: "SeeTag",

  propTypes: {
    string: React.PropTypes.string
  },

  render() {
    return (
      <span className="see-tag">
        See also:
        {' '}

        <span
          dangerouslySetInnerHTML={{
            __html: this.props.string
          }}
        />
      </span>
    );
  }
});

module.exports = SeeTag;