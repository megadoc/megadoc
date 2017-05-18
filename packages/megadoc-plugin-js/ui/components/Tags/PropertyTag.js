const React = require("react");
const HighlightedText = require('components/HighlightedText');
const HeadingAnchor = require('components/HeadingAnchor');
const TypeNames = require('./TypeNames');
const DefaultValue = require('./DefaultValue');
const describeNode = require('../../utils/describeNode');
const DocClassifier = require('../../utils/DocClassifier');
const Collapsible = require('mixins/Collapsible');
const classSet = require('classnames');
const { shape, string, object, node } = React.PropTypes;

const PropertyTag = React.createClass({
  mixins: [ Collapsible ],

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
    const collapsed = this.isCollapsed();

    return (
      <div className={classSet("property-tag", {
        'collapsible': this.isCollapsible(),
        'collapsible--collapsed': this.isCollapsed(),
      })}>
        <header
          className={classSet("property-tag__header anchorable-heading", {
            "collapsible-header": this.isCollapsible()
          })}
          onClick={this.toggleCollapsed}
        >
          {this.isCollapsible() && this.renderCollapser()}
          {anchor && <HeadingAnchor.Anchor href={this.props.anchor} />}
          {anchor && <HeadingAnchor.Link href={this.props.anchor} />}

          <span className="property-tag__name">
            {typeInfo.name || doc && doc.name}

          </span>

          {': '}

          <code><TypeNames type={typeInfo.type} /></code>

          {doc && DocClassifier.isPrivate(doc) && (
            <span className="doc-entity__modifier doc-entity__private">PRIVATE</span>
          )}
        </header>

        {!collapsed && description && (
          <HighlightedText className="property-tag__description">
            {description}
          </HighlightedText>
        )}

        {!collapsed && defaultValue && (
          <DefaultValue defaultValue={defaultValue} />
        )}

        {!collapsed && this.props.children}
      </div>
    );
  }
});

module.exports = PropertyTag;