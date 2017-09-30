const React = require('react');
const ArticleTOC = require('../components/ArticleTOC')
const { object, bool, shape, } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'Markdown::DocumentTOCOutlet',

  propTypes: {
    documentEntityNode: object,
    documentNode: object.isRequired,
    namespaceNode: object.isRequired,
    $outletOptions: shape({
      grouped: bool
    }),
  },

  render() {
    if (!this.props.documentNode) {
      return null;
    }

    return (
      <ArticleTOC flat grouped={this.props.$outletOptions.grouped} {...this.props} />
    );
  }
});
