const React = require("react");
const HighlightedText = require('components/HighlightedText');
const Types = require('components/Tags/Types');
const Doc = require('components/Doc');

const { shape, string, arrayOf, object } = React.PropTypes;

const PropertyTag = React.createClass({
  displayName: "PropertyTag",

  propTypes: {
    anchorId: string,
    typeInfo: shape({
      types: arrayOf(string),
      name: string,
      defaultValue: string,
      description: string
    }),

    doc: object,
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

        {this.props.doc && typeInfo.types[0].toLowerCase() === 'function' && (
          <Doc
            withTitle={false}
            collapsible={false}
            doc={this.props.doc}
          />
        )}
      </li>
    );
  }
});

module.exports = PropertyTag;