const React = require("react");
const HighlightedText = require('components/HighlightedText');
const Types = require('components/Tags/Types');
const Anchor = require('components/Anchor');

const { shape, string, arrayOf, node } = React.PropTypes;

const PropertyTag = React.createClass({
  displayName: "PropertyTag",

  propTypes: {
    anchor: node,
    typeInfo: shape({
      types: arrayOf(string),
      name: string,
      defaultValue: string,
      description: string
    })
  },

  render() {
    const { typeInfo } = this.props;

    return (
      <li className="property-tag">
        {this.props.anchor || null}

        <header className="property-tag__header">
          <span className="property-tag__name">
            <code>{typeInfo.name}</code>
          </span>

          {': '}

          <Types types={typeInfo.types} />
        </header>

        {typeInfo.description && (
          <HighlightedText className="property-tag__description">
            {typeInfo.description}
          </HighlightedText>
        )}

        {typeInfo.defaultValue && (
          <p className="property-tag__default-value">
            Defaults to: <code>{typeInfo.defaultValue}</code>
          </p>
        )}
      </li>
    );
  }
});

module.exports = PropertyTag;