var React = require("react");
var { Link } = require('react-router');
var Icon = require('components/Icon');

var Navigation = React.createClass({
  displayName: "Navigation",
  statics: {
    key: 'javascript'
  },

  render() {
    return (
      <Link to="js">
        <Icon className="icon-javascript">
          <span className="path1" />
          <span className="path2" />
        </Icon>

        {' '}
        JavaScripts
      </Link>
    );
  }
});

module.exports = Navigation;