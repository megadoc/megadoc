var React = require("react");
var { Link } = require('react-router');
var Icon = require('components/Icon');
var config = require('config');

var Navigation = React.createClass({
  displayName: "Navigation",
  statics: {
    key: 'git'
  },

  render() {
    const icon = config.navigationIcon;
    const label = config.navigationLabel;

    return (
      <Link to="git">
        {icon && <Icon className={icon} />} {label || 'Activity'}
      </Link>
    );
  }
});

module.exports = Navigation;