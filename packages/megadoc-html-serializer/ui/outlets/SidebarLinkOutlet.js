const React = require('react');
const LinkOutlet = require('./LinkOutlet');
const { assign } = require('lodash');

const SidebarLinkOutlet = React.createClass({
  propTypes: {
    $outletOptions: React.PropTypes.object.isRequired,
  },

  render() {
    const { $outletOptions } = this.props

    return (
      <LinkOutlet $outletOptions={assign({
        className: "sidebar-link class-browser__entry-link"
      }, $outletOptions)} />
    )
  },
});

module.exports = SidebarLinkOutlet