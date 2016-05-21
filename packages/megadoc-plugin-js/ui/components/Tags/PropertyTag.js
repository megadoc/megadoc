const React = require("react");
const HighlightedText = require('components/HighlightedText');
const HeadingAnchor = require('components/HeadingAnchor');
const TypeNames = require('./TypeNames');
const Doc = require('../Doc');

const { shape, string, object } = React.PropTypes;

const PropertyTag = React.createClass({
  displayName: "PropertyTag",

  propTypes: {
    anchor: string,
    typeInfo: shape({
      type: object,
      name: string,
      defaultValue: string,
      description: string
    }),

    doc: object,
  },

  render() {
    const { typeInfo, doc } = this.props;
    const description = typeInfo.description || doc.description;

    return (
      <li className="property-tag">
        <header className="property-tag__header anchorable-heading">
          <HeadingAnchor.Anchor href={this.props.anchor} />
          <HeadingAnchor.Link href={this.props.anchor} />

          <span className="property-tag__name">
            {typeInfo.name || doc.name}
          </span>

          {': '}

          <code><TypeNames type={typeInfo.type} /></code>
        </header>

        {description && (
          <HighlightedText className="property-tag__description">
            {description}
          </HighlightedText>
        )}

        {typeInfo.defaultValue && (
          <p className="property-tag__default-value">
            Defaults to: <code>{typeInfo.defaultValue}</code>
          </p>
        )}

        {this.props.doc && typeInfo.type.name.toLowerCase() === 'function' && (
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