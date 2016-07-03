const React = require('react');
const ArticleTOC = require('../components/ArticleTOC')
const { object } = React.PropTypes;

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
    },

    render() {

      return (
        <ArticleTOC flat {...this.props} />
      );
    }
  })
});
