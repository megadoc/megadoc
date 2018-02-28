var React = require('react');
var { where } = require('lodash');
var Collapsible = require('mixins/Collapsible');
var classSet = require('utils/classSet');
var TypeNames = require('./Tags/TypeNames');
var DefaultValue = require('./Tags/DefaultValue');
var HighlightedText = require('components/HighlightedText');

var TabularTagGroup = React.createClass({
  mixins: [ Collapsible ],

  propTypes: {
    tagName: React.PropTypes.string,
    tagType: React.PropTypes.string,
    alwaysGroup: React.PropTypes.bool,
    tags: React.PropTypes.array,
    hideIfEmpty: React.PropTypes.bool,

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
    else if (this.props.hideIfEmpty && tags.every(tagIsBlank)) {
      return null;
    }
    else if (tags.length === 1 && !this.props.alwaysGroup) {
      return <Renderer withTitle {...tags[0]} />;
    }
    else {
      className = classSet(this.props.className, {
        'tag-group': true,
        'tag-group--tabular': true,
        'tag-group--collapsed': isCollapsed,
        'collapsible': this.isCollapsible(),
        'collapsible--collapsed': isCollapsed,
        'tag-group--single-child': tags.length === 1
      });

      return (
        <DOMTag className={className}>
          {this.props.children && (
            <h4 className="tag-group__header collapsible-header" onClick={this.toggleCollapsed}>
              {this.renderCollapser()}
              {this.props.children}
            </h4>
          )}

          {!isCollapsed && (
            <table>
              <tbody>
                {tags.map(this.renderTag)}
              </tbody>
            </table>
          )}
        </DOMTag>
      );
    }
  },

  renderTag(tag, i) {
    const { typeInfo } = tag;
    const hasName = Boolean(typeInfo.name && typeInfo.name.length > 0);

    return (
      <tr key={i} className="param-tag">
        <td className="tag-group__primary-column">
          {hasName && (
            <header className="param-tag__header">
              <code className="param-tag__name">{typeInfo.name}</code>
            </header>
          )}
        </td>

        <td>
          {typeInfo.type && (
            <code className="param-tag__types">
              <TypeNames type={typeInfo.type} />
            </code>
          )}

          {typeInfo.description && (
            <HighlightedText className="param-tag__description">
              {typeInfo.description.replace(/[ ]{4,}/g, '')}
            </HighlightedText>
          )}

          <DefaultValue defaultValue={typeInfo.defaultValue} />
        </td>
      </tr>
    );
  }
});

function tagIsBlank({ string }) {
  return !string || !string.length === 0
}

module.exports = TabularTagGroup;