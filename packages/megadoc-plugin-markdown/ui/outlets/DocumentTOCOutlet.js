const React = require('react');
const ArticleTOC = require('../components/ArticleTOC')
const { object, bool, shape, } = React.PropTypes;

module.exports = React.createClass({
  propTypes: {
    documentEntityNode: object,
    documentNode: object.isRequired,
    namespaceNode: object.isRequired,
    $outletOptions: shape({
      grouped: bool
    }),
  },

  statics: {
    match(props) {
      return (
        props.namespaceNode &&
        props.namespaceNode.name === 'megadoc-plugin-markdown' &&
        !!props.documentNode
      );
    },
  },

  render() {

    return (
      <ArticleTOC flat grouped={this.props.$outletOptions.grouped} {...this.props} />
    );
  }
});
