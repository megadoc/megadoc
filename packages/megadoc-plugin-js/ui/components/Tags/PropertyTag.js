const React = require("react");
const HighlightedText = require('components/HighlightedText');
const HeadingAnchor = require('components/HeadingAnchor');
const TypeNames = require('./TypeNames');
const DefaultValue = require('./DefaultValue');
const describeNode = require('../../utils/describeNode');
const DocClassifier = require('../../utils/DocClassifier');

const { shape, string, object, node } = React.PropTypes;

const PropertyTag = React.createClass({
  displayName: "PropertyTag",

  propTypes: {
    children: node,
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
    const { anchor, typeInfo, doc } = this.props;
    const description = typeInfo.description || doc && doc.description;
    const defaultValue = typeInfo.defaultValue || doc && describeNode(doc.nodeInfo);

    return (
      <li className="property-tag">
        <header className="property-tag__header anchorable-heading">
          {anchor && <HeadingAnchor.Anchor href={this.props.anchor} />}
          {anchor && <HeadingAnchor.Link href={this.props.anchor} />}

          <span className="property-tag__name">
            {typeInfo.name || doc && doc.name}

            {doc && DocClassifier.isPrivate(doc) && (
              <span className="doc-entity__modifier doc-entity__private">PRIVATE</span>
            )}

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

        {this.props.children}
      </li>
    );
  }
});

module.exports = PropertyTag;