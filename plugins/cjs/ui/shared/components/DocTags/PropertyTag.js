var React = require("react");
var MarkdownText = require('components/MarkdownText');

var PropertyTag = React.createClass({
  displayName: "PropertyTag",

  render() {
    return (
      <li className="property-tag">
        <header className="property-tag__header">
          <span className="property-tag__name">
            <code>{this.props.name}</code>
          </span>

          {': '}

          <code>{this.props.types.join(', ')}</code>
        </header>

        <MarkdownText className="property-tag__description">
          {this.props.description}
        </MarkdownText>

        {this.props.defaultValue &&
          <p className="property-tag__default-value">Defaults to: <code>{this.props.defaultValue}</code></p>
        }
      </li>
    );
  }
});

module.exports = PropertyTag;