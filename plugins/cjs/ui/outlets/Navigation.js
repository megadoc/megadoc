var React = require("react");
var { Link } = require('react-router');
var Icon = require('components/Icon');

module.exports = function createNavigationOutlet(routeName, label = 'JavaScripts', icon = null) {
  return React.createClass({
    displayName: 'CJSNavigation',

    statics: {
      key: routeName
    },

    render() {
      return (
        <Link to={routeName}>
          {icon && <Icon className={icon} />} {label}
        </Link>
      );
    }
  });
};