const React = require("react");
const HighlightedText = require('components/HighlightedText');
const Types = require('components/Tags/Types');

const { shape, string, arrayOf } = React.PropTypes;

const PropertyTag = React.createClass({
  displayName: "PropertyTag",

  propTypes: {
    anchorId: string,
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
        <header
          id={this.props.anchorId}
          className="property-tag__header anchorable-heading"
        >
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