var React = require("react");
var DeprecatedTag = React.createClass({
  propTypes: {
    string: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <blockquote className="blockquote--warning">
        <p><strong>Deprecated</strong></p>

        <div dangerouslySetInnerHTML={{ __html: this.props.string }} />
      </blockquote>
    );
  }
});

module.exports = DeprecatedTag;