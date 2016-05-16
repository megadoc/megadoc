const React = require('react');
const Article = require('../components/Article')
const { object } = React.PropTypes;

megadoc.outlets.add('Markdown::Document', {
  key: 'Markdown::Document',

  component: React.createClass({
    propTypes: {
      documentNode: object,
    },

    render() {
      if (!this.props.documentNode || !this.props.documentNode.properties) {
        return null;
      }

      return (
        <Article {...this.props} />
      );
    }
  })
});
