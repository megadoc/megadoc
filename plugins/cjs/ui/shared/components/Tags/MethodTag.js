var React = require("react");
var MarkdownText = require('components/MarkdownText');

var MethodTag = React.createClass({
  displayName: "MethodTag",

  propTypes: {
    name: React.PropTypes.string,
    description: React.PropTypes.string,
  },

  render() {
    return (
      <div>
        <h3>
          <code>{this.props.name})</code>
        </h3>

        <MarkdownText className="param-tag__description">
          {this.props.description}
        </MarkdownText>
      </div>
    );
  }
});

module.exports = MethodTag;