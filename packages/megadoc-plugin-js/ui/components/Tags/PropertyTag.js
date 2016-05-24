const React = require("react");
const HighlightedText = require('components/HighlightedText');
const HeadingAnchor = require('components/HeadingAnchor');
const TypeNames = require('./TypeNames');
const DefaultValue = require('./DefaultValue');
const Doc = require('../Doc');
const K = require('../../constants');
const describeNode = require('../../utils/describeNode');

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
    const defaultValue = typeInfo.defaultValue || describeNode(doc.nodeInfo);

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

        {defaultValue && (
          <DefaultValue defaultValue={defaultValue} />
        )}

        {this.props.doc && this.props.doc.type && this.props.doc.type === K.TYPE_FUNCTION && (
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