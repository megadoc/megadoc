const React = require('react');
const Browser = require('../components/Browser');
const { PropTypes } = React;

const BrowserOutlet = React.createClass({
  propTypes: {
    $outletOptions: PropTypes.shape({
      expanded: PropTypes.bool
    }).isRequired,
  },
  render() {
    return (
      <Browser {...this.props} expanded={this.props.$outletOptions.expanded} />
    );
  },
});

module.exports = BrowserOutlet;