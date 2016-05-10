const React = require('react');
const Article = require('../components/Article')
const { object } = React.PropTypes;

tinydoc.outlets.add('Markdown::Document', {
  key: 'Markdown::Document',

  component: React.createClass({
    propTypes: {
      namespaceNode: object,
    },

    render() {
      return (
        <Article {...this.props} />
      );
    }
  })
});
