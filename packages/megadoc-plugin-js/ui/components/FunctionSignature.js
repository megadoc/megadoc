const React = require('react');
const { bool, object, } = React.PropTypes;
const describeType = require('../utils/describeType');

const FunctionSignature = React.createClass({
  contextTypes: {
    config: React.PropTypes.object.isRequired,
  },

  propTypes: {
    doc: object,
    withNames: bool,
    withBraces: bool,
  },

  getDefaultProps() {
    return {
      withNames: true,
      withBraces: true
    };
  },

  render() {
    const { withNames } = this.props;
    const describeTypeHTML = describeType({
      expandFunctionSignatures: this.context.config.expandReturnedFunctionSignatures,
      html: true,
    })
    const describeTypeText = describeType({
      expandFunctionSignatures: this.context.config.expandReturnedFunctionSignatures,
      html: false,
    })

    const paramTags = this.props.doc.tags.filter(function(tag) {
      return tag.type === 'param' && (tag.typeInfo.name || '?').indexOf('.') === -1;
    })

    const paramLines = paramTags.map(function(param) {
      if (withNames && param.typeInfo.name) {
        return '<em>' + (param.typeInfo.name || '?') + '</em>: ' + describeTypeHTML(param.typeInfo.type);
      }
      else {
        return describeTypeHTML(param.typeInfo.type);
      }
    })

    // it's 3:42 AM and i can't sleep
    const paramTagTotalLength = paramTags.map(tag => {
      if (withNames && tag.typeInfo.name) {
        return tag.typeInfo.name + ': ' + describeTypeText(tag.typeInfo.type);
      }
      else {
        return describeTypeText(tag.typeInfo.type);
      }
    }).join(', ').length

    const needsBreak = paramTagTotalLength >= 40
    const html = paramLines
      .map(line => {
        return needsBreak ? `<br />&nbsp;&nbsp;${line}` : line
      })
      .join(', ') + (needsBreak ? '<br />' : '')
    ;

    return (
      <span
        className="doc-entity__function-signature"
        dangerouslySetInnerHTML={{
          __html: this.props.withBraces ? `(${html})` : html
        }}
      />
    );
  }
});

module.exports = FunctionSignature;
