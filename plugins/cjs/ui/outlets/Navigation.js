var React = require("react");
var { Link } = require('react-router');
var Icon = require('components/Icon');

module.exports = function createNavigationOutlet(routeName, label = 'JavaScripts') {
  return React.createClass({
    displayName: 'CJSNavigation',

    statics: {
      key: routeName
    },

    render() {
      return (
        <Link to={routeName}>
          <Icon className="icon-javascript">
            <span className="path1" />
            <span className="path2" />
          </Icon>

          {' '}
          {label}
        </Link>
      );
    }
  });
};