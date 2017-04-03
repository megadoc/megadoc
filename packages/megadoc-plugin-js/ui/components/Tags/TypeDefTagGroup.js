var React = require('react');
var Collapsible = require('mixins/Collapsible');
var classSet = require('utils/classSet');

var TypeDefTagGroup = React.createClass({
  mixins: [ Collapsible ],

  propTypes: {
    tagName: React.PropTypes.string,
    alwaysGroup: React.PropTypes.bool,
    documents: React.PropTypes.array,

    renderer: React.PropTypes.func,
    className: React.PropTypes.string,
    children: React.PropTypes.any,
  },

  getDefaultProps: function() {
    return {
      tagName: 'div',
      alwaysGroup: false
    };
  },

  render() {
    var DOMTag = this.props.tagName;
    var documents = this.props.documents;
    var Renderer = this.props.renderer;
    var isCollapsed = this.isCollapsed();
    var className;

    if (documents.length === 0) {
      return null;
    }
    else if (documents.length === 1 && !this.props.alwaysGroup) {
      return <Renderer withTitle document={documents[0]} />;
    }
    else {
      className = classSet({
        'tag-group': true,
        'tag-group--collapsed': isCollapsed,
        'collapsible': this.isCollapsible(),
        'collapsible--collapsed': isCollapsed,
        'tag-group--single-child': documents.length === 1
      });

      return (
        <DOMTag className={`${className} ${this.props.className||''}`}>
          {this.props.children && (
            <h4 className="tag-group__header collapsible-header" onClick={this.toggleCollapsed}>
              {this.renderCollapser()}
              {this.props.children}
            </h4>
          )}

          {!isCollapsed && documents.map(function(tag, i) {
            return <Renderer key={i} withTitle={false} document={tag} />;
          })}
        </DOMTag>
      );
    }
  }
});

module.exports = TypeDefTagGroup;