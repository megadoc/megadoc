const React = require('react');
const { shape, string } = React.PropTypes;

const SidebarHeaderOutlet = React.createClass({
  propTypes: {
    $outletOptions: shape({
      text: string.isRequired,
    }),
  },

  render() {
    return (
      <h3 className="layout__sidebar-header">
        {this.props.$outletOptions.text}
      </h3>
    );
  }
});

module.exports = function(megadoc) {
  megadoc.outlets.add('Layout::SidebarHeader', {
    key: 'xxx',
    component: SidebarHeaderOutlet
  });
};