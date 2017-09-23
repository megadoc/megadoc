const React = require('react');
const Article = require('../components/Article')
const { object } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'Markdown::DocumentOutlet',

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
});
