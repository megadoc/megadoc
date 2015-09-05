var React = require("react");
var { Link } = require('react-router');

var Navigation = React.createClass({
  statics: {
    key: 'api'
  },

  render() {
    return (
      <Link to="api">
        <span className="icon icon-ruby">
          <span className="path1" />
          <span className="path2" />
          <span className="path3" />
          <span className="path4" />
          <span className="path5" />
          <span className="path6" />
          <span className="path7" />
          <span className="path8" />
          <span className="path9" />
        </span>

        API
      </Link>
    );
  }
});

module.exports = Navigation;