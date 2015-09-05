var React = require("react");
var ellipsify = require('utils/ellipsify');
var classSet = require('utils/classSet');
var MarkdownText = require('components/MarkdownText');
var DocTags = require('components/DocTags');
var Collapsible = require('mixins/Collapsible');

function params(tags) {
  return tags.filter(function(tag){
    return tag.type === 'param' && tag.name.indexOf('.') === -1;
  }).map(function(param){
    return param.name + ':' + param.types.join('|');
  }).join(', ');
}

function isMethod(doc) {
  return doc.ctx.type === 'method' || doc.ctx.type === 'function';
}

var DocEntity = React.createClass({
  displayName: "DocEntity",

  mixins: [ Collapsible ],

  propTypes: {
    withTitle: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      withTitle: true,
      withDescription: true,
      withExamples: true
    };
  },

  render() {
    var isCollapsed = this.isCollapsed();
    var className = classSet({
      'doc-entity': true,
      'collapsible': !!this.props.collapsible,
      'collapsible--collapsed': isCollapsed,
    });

    var description = this.props.description.full;
    var summary = this.props.description.summary;

    const doc = this.props;

    return (
      <div className={className}>
        {this.props.withTitle && (
          <h4 className="doc-entity__header collapsible-header" onClick={this.toggleCollapsed}>
            {this.renderCollapser()}

            <span className="doc-entity__name">
              {doc.ctx.name}

              {isMethod(doc) && (
                <span className="doc-entity__method-params">
                  ({params(doc.tags)})
                </span>
              )}

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
            </span>
          </h4>
        )}

        {!this.props.isConstructor && this.props.withDescription && (
          <MarkdownText className="doc-entity__description">
            {isCollapsed ? (
              ellipsify(summary, 120) +
              (summary.length < 120 && description.length > summary.length ?
                '...' :
                ''
              )
            ) : description}
          </MarkdownText>
        )}

        {!isCollapsed && (
          <DocTags
            tags={this.props.tags}
            withExamples={!this.props.isConstructor && this.props.withExamples}
            withAdditionalResources={this.props.withAdditionalResources}
          />
        )}
      </div>
    );
  }
});

module.exports = DocEntity;