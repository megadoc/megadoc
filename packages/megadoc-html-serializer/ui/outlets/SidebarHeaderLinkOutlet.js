const React = require('react');
const LinkOutlet = require('./LinkOutlet');
const SidebarHeader = require('components/SidebarHeader');
const { assign } = require('lodash');

const SidebarHeaderLinkOutlet = React.createClass({
  propTypes: {
    $outletOptions: React.PropTypes.object.isRequired,
  },

  render() {
    const { $outletOptions } = this.props

    return (
      <SidebarHeader>
        <LinkOutlet $outletOptions={assign({
          className: "sidebar-link class-browser__entry-link"
        }, $outletOptions)} />
      </SidebarHeader>
    )
  },
});

module.exports = SidebarHeaderLinkOutlet