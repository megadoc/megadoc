const React = require('react');
const ArticleTOC = require('../components/ArticleTOC')
const { object } = React.PropTypes;

tinydoc.outlets.add('Markdown::DocumentTOC', {
  key: 'Markdown::DocumentTOC',

  component: React.createClass({
    propTypes: {
      documentNode: object.isRequired,
      documentEntityNode: object,
    },

    render() {
      return (
        <ArticleTOC {...this.props} />
      );
    }
  })
});
