var React = require("react");
var ellipsify = require('utils/ellipsify');
var classSet = require('utils/classSet');
var MarkdownText = require('components/MarkdownText');
var DocTags = require('components/DocTags');
var Collapsible = require('mixins/Collapsible');

var DocEntity = React.createClass({
  displayName: "DocEntity",

  mixins: [ Collapsible ],

  propTypes: {
    withTitle: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      withTitle: true,
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

    return (
      <div className={className}>
        {this.props.withTitle && (
          <h4 className="doc-entity__header collapsible-header" onClick={this.toggleCollapsed}>
            {this.renderCollapser()}

            <span className="doc-entity__name">
              {this.props.ctx.name}
              {this.props.isConstructor && (
                <span> (constructor)</span>
              )}
            </span>
          </h4>
        )}

        {!this.props.isConstructor && (
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

        {!isCollapsed &&
          <DocTags
            tags={this.props.tags}
            showExamples={!this.props.isConstructor}
          />
        }
      </div>
    );
  }
});

module.exports = DocEntity;