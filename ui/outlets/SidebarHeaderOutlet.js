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
      <header className="layout__sidebar-header">
        {this.props.$outletOptions.text}
      </header>
    );
  }
});

module.exports = function(tinydoc) {
  tinydoc.outlets.add('Layout::SidebarHeader', {
    key: 'xxx',
    component: SidebarHeaderOutlet
  });
};