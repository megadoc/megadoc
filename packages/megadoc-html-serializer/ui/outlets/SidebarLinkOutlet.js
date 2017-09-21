const React = require('react');
const LinkOutlet = require('./LinkOutlet');

const SidebarLinkOutlet = React.createClass({
  propTypes: {
    $outletOptions: React.PropTypes.object.isRequired,
  },

  render() {
    const { $outletOptions } = this.props

    return (
      <LinkOutlet $outletOptions={Object.assign({
        className: "sidebar-link class-browser__entry-link"
      }, $outletOptions)} />
    )
  },
});

module.exports = SidebarLinkOutlet