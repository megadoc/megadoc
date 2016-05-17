const React = require('react');
const ArticleTOC = require('../components/ArticleTOC')
const { object } = React.PropTypes;

megadoc.outlets.add('Markdown::DocumentTOC', {
  key: 'Markdown::DocumentTOC',

  component: React.createClass({
    propTypes: {
      documentNode: object.isRequired,
      documentEntityNode: object,
    },

    render() {
      return (
        <ArticleTOC flat {...this.props} />
      );
    }
  })
});
