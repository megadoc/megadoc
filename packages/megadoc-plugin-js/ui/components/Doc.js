const React = require('react');
const classSet = require('utils/classSet');
const HighlightedText = require('components/HighlightedText');
const DocTags = require('./DocTags');
const FunctionSignature = require('./FunctionSignature');
const TypeNames = require('./Tags/TypeNames');
const DeprecatedTag = require('./Tags/DeprecatedTag');
const K = require('../constants');
const Collapsible = require('mixins/Collapsible');
const { object, bool, string } = React.PropTypes;
const HeadingAnchor = require('components/HeadingAnchor');

const Doc = React.createClass({
  mixins: [ Collapsible ],

  propTypes: {
    anchor: string,
    doc: object.isRequired,
    collapsible: bool,
    expanded: bool,
    withExamples: bool,
    withTitle: bool,
    withDescription: bool,
    withAdditionalResources: bool,
  },

  getDefaultProps: function() {
    return {
      withTitle: true,
      withDescription: true,
      withExamples: true
    };
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (
      nextProps.doc !== this.props.doc ||
      nextState.collapsed !== this.state.collapsed ||
      nextProps.expanded !== this.props.expanded
    );
  },

  render() {
    var isCollapsed = this.isCollapsed();
    var className = classSet({
      'doc-entity': true,
      'collapsible': !!this.props.collapsible,
      'collapsible--expanded': !isCollapsed,
      'collapsible--collapsed': isCollapsed,
    });

    const { doc, anchor } = this.props;
    const description = doc.description;
    const deprecatedTag = doc.tags.filter((t) => t.type === 'deprecated')[0];

    return (
      <div className={className}>
        {this.props.withTitle && (
          <h4
            className={
              classSet({
                "doc-entity__header": true,
                "collapsible-header": true,
                "anchorable-heading": !!anchor
              })
            }
            onClick={this.toggleCollapsed}
            title={doc.name}
          >
            {this.renderCollapser()}
            {anchor && <HeadingAnchor.Anchor href={anchor} />}
            {anchor && <HeadingAnchor.Link href={anchor} />}

            <HeadingAnchor.Text className="doc-entity__name">
              <span className="doc-entity__name-fragment">
                {doc.name}
              </span>

              {isFunction(doc) && (
                <FunctionSignature doc={doc} />
              )}

              {this.renderReturnType()}

              {doc.isConstructor && (
                <span className="doc-entity__modifier">CONSTRUCTOR</span>
              )}

              {doc.isProtected && (
                <span className="doc-entity__modifier doc-entity__protected">PROTECTED</span>
              )}

              {doc.isPrivate && (
                <span className="doc-entity__modifier doc-entity__private">PRIVATE</span>
              )}

              {doc.tags.some((t) => t.type === 'async') && (
                <span className="doc-entity__modifier doc-entity__async">ASYNC</span>
              )}

              {deprecatedTag && (
                <span className="doc-entity__modifier doc-entity__async">DEPRECATED</span>
              )}
            </HeadingAnchor.Text>
          </h4>
        )}

        <div className="doc-entity__description">
          {deprecatedTag && deprecatedTag.string.length && (
            <DeprecatedTag string={deprecatedTag.string} />
          )}

          {this.props.withDescription && description && !isCollapsed && (
            <HighlightedText>
              {description}
            </HighlightedText>
          )}
        </div>

        {!isCollapsed && (
          <DocTags
            tags={doc.tags}
            withExamples={this.props.withExamples}
            withAdditionalResources={this.props.withAdditionalResources}
          />
        )}
      </div>
    );
  },

  renderReturnType() {
    const [ tag ] = this.props.doc.tags.filter(t => t.type === 'return');

    if (!tag) {
      return null;
    }

    return (
      <span className="doc-entity__method-params">
        {' -> '}
        <TypeNames type={tag.typeInfo.type} />
      </span>
    );
  }
});

function isFunction(doc) {
  return doc.type === K.TYPE_FUNCTION;
}

module.exports = Doc;