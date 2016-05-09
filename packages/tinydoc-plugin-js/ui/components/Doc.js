const React = require('react');
const classSet = require('utils/classSet');
const HighlightedText = require('components/HighlightedText');
const DocTags = require('./DocTags');
const TypeNames = require('./Tags/TypeNames');
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
    initiallyCollapsed: bool,
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
      nextProps.expanded !== this.props.expanded ||
      nextProps.initiallyCollapsed !== this.props.initiallyCollapsed
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

    return (
      <div className={className}>
        {anchor && (
          <HeadingAnchor.Anchor href={anchor} />
        )}

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

            <span className="doc-entity__name">
              {doc.name}

              {isFunction(doc) && (
                <span className="doc-entity__method-params">
                  (
                    <span
                      dangerouslySetInnerHTML={{ __html: params(doc.tags) }}
                    />
                  )
                </span>
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

              {anchor && (
                <HeadingAnchor.Link href={anchor} trailing />
              )}
            </span>
          </h4>
        )}

        <div className="doc-entity__description">
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
        <TypeNames types={tag.typeInfo.types} />
      </span>
    );
  }
});

function params(tags) {
  return tags.filter(function(tag){
    return tag.type === 'param' && tag.typeInfo.name.indexOf('.') === -1;
  }).map(function(param){
    return param.typeInfo.name + ': ' + param.typeInfo.types.join('|');
  }).join(', ');
}

function isFunction(doc) {
  return doc.ctx.type === 'function';
}

module.exports = Doc;