var React = require("react");
var { Link } = require('react-router');
var config = require('config');

var Navigation = React.createClass({
  statics: {
    key: 'api'
  },

  render() {
    return (
      <Link to="api">
        {config.icon && <Icon className={config.icon} />} {config.navigationLabel || 'API'}
      </Link>
    );
  }
});

module.exports = Navigation;