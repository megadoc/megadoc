const React = require('react');
const Browser = require('../components/Browser')
const { array, object, shape, bool, } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'Markdown::BrowserOutlet',

  propTypes: {
    namespaceNode: object,
    $outletOptions: shape({
      flat: bool,
      filter: array,
    })
  },

  render() {
    return (
      <Browser
        {...this.props}
        flat={this.props.$outletOptions.flat}
        filter={this.props.$outletOptions.filter}
      />
    );
  }
});