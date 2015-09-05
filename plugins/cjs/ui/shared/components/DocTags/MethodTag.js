var React = require("react");
var MarkdownText = require('components/MarkdownText');

var MethodTag = React.createClass({
  displayName: "MethodTag",

  render() {
    return (
      <div>
        <h3>
          <code>{this.props.ctx.name})</code>
        </h3>

        <MarkdownText className="param-tag__description">
          {this.props.description.full}
        </MarkdownText>
      </div>
    );
  }
});

module.exports = MethodTag;