const React = require('react');
const SidebarHeader = require('components/SidebarHeader');
const { shape, string } = React.PropTypes;

const SidebarHeaderOutlet = React.createClass({
  propTypes: {
    $outletOptions: shape({
      text: string.isRequired,
    }),
  },

  render() {
    return (
      <SidebarHeader>
        {this.props.$outletOptions.text}
      </SidebarHeader>
    );
  }
});

module.exports = SidebarHeaderOutlet;