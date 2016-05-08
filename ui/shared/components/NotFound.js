const React = require("react");

// TODO: customize
const NotFound = React.createClass({
  displayName: "NotFound",

  render() {
    return (
      <div className="four-oh-four">
        <h1>404</h1>
        <p>We're sorry, but we think there's a very good chance you've hit the void!</p>
      </div>
    );
  }
});

module.exports = NotFound;