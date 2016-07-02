const React = require('react');
const ArticleTOC = require('../components/ArticleTOC')
const { object } = React.PropTypes;

megadoc.outlets.add('Markdown::DocumentTOC', {
  key: 'Markdown::DocumentTOC',

  component: React.createClass({
    propTypes: {
      documentEntityNode: object,
      documentNode: object.isRequired,
      namespaceNode: object.isRequired,
    },

    render() {
      if (this.props.namespaceNode.name !== 'megadoc-plugin-markdown') {
        return null;
      }

      return (
        <ArticleTOC flat {...this.props} />
      );
    }
  })
});
