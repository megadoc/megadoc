const React = require('react');
const { node } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'SidebarHeader',

  propTypes: {
    children: node.isRequired,
  },

  render() {
    return (
      <h3 className="layout__sidebar-header">
        {this.props.children}
      </h3>
    );
  }
});