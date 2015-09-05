var React = require("react");
var { Link } = require('react-router');
var Icon = require('components/Icon');

var Navigation = React.createClass({
  displayName: "Navigation",
  statics: {
    key: 'git'
  },

  render() {
    return (
      <Link to="git">
        <Icon className="icon-pulse" /> Activity
      </Link>
    );
  }
});

module.exports = Navigation;