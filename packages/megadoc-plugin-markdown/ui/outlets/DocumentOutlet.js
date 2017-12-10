const React = require('react');
const Article = require('../components/Article')
const { object } = React.PropTypes;
const { PropTypes } = React;

module.exports = React.createClass({
  displayName: 'Markdown::DocumentOutlet',

  propTypes: {
    documentNode: object,
    $outletOptions: PropTypes.shape({
      className: PropTypes.string
    }),
  },

  render() {
    if (!this.props.documentNode || !this.props.documentNode.properties) {
      return null;
    }

    return (
      <Article {...this.props} {...this.props.$outletOptions} />
    );
  }
});
