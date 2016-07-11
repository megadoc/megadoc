const React = require('react');
const ArticleTOC = require('../components/ArticleTOC')
const { object, bool, shape, } = React.PropTypes;

megadoc.outlets.add('Markdown::DocumentTOC', {
  key: 'Markdown::DocumentTOC',

  match(props) {
    return (
      props.namespaceNode &&
      props.namespaceNode.name === 'megadoc-plugin-markdown' &&
      !!props.documentNode
    );
  },

  component: React.createClass({
    propTypes: {
      documentEntityNode: object,
      documentNode: object.isRequired,
      namespaceNode: object.isRequired,
      $outletOptions: shape({
        grouped: bool
      }),
    },

    render() {

      return (
        <ArticleTOC flat grouped={this.props.$outletOptions.grouped} {...this.props} />
      );
    }
  })
});
