const React = require('react');
const { bool, object, } = React.PropTypes;

const FunctionSignature = React.createClass({
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
    const html = this.props.doc.tags
      .filter(function(tag) {
        return tag.type === 'param' && tag.typeInfo.name.indexOf('.') === -1;
      })
      .map(function(param) {
        if (withNames) {
          return '<em>' + param.typeInfo.name + '</em>: ' + param.typeInfo.types.join('|');
        }
        else {
          return param.typeInfo.types.join('|');
        }
      }).join(', ')
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
