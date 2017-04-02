const React = require('react');
const Browser = require('../components/Browser')
const { object, shape, bool, } = React.PropTypes;

module.exports = React.createClass({
  propTypes: {
    namespaceNode: object,
    $outletOptions: shape({
      flat: bool,
    })
  },

  render() {
    return (
      <Browser {...this.props} flat={this.props.$outletOptions.flat} />
    );
  }
});