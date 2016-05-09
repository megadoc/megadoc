var React = require('react');
var { where } = require('lodash');
var Collapsible = require('mixins/Collapsible');
var classSet = require('utils/classSet');

var TagGroup = React.createClass({
  mixins: [ Collapsible ],

  propTypes: {
    tagName: React.PropTypes.string,
    tagType: React.PropTypes.string,
    alwaysGroup: React.PropTypes.bool,
    tags: React.PropTypes.array,

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
    var tags = this.props.tagType ?
      where(this.props.tags, { type: this.props.tagType }) :
      this.props.tags
    ;
    var Renderer = this.props.renderer;
    var isCollapsed = this.isCollapsed();
    var className;

    if (tags.length === 0) {
      return null;
    }
    else if (tags.length === 1 && !this.props.alwaysGroup) {
      return <Renderer withTitle {...tags[0]} />;
    }
    else {
      className = classSet({
        'tag-group': true,
        'tag-group--collapsed': isCollapsed,
        'collapsible': this.isCollapsible(),
        'collapsible--collapsed': isCollapsed,
        'tag-group--single-child': tags.length === 1
      });

      return (
        <DOMTag className={`${className} ${this.props.className||''}`}>
          {this.props.children && (
            <h4 className="tag-group__header collapsible-header" onClick={this.toggleCollapsed}>
              {this.renderCollapser()}
              {this.props.children}
            </h4>
          )}

          {!isCollapsed && tags.map(function(tag, i) {
            return <Renderer key={i} withTitle={false} {...tag} />;
          })}
        </DOMTag>
      );
    }
  }
});

module.exports = TagGroup;