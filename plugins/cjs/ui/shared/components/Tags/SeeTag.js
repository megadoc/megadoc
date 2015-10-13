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
        See also:
        {' '}

        <span
          dangerouslySetInnerHTML={{
            __html: this.props.string
          }}
        />
      </p>
    );
  }
});

module.exports = SeeTag;