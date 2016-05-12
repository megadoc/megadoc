const React = require("react");

// TODO: customize
//
// SMELL ALERT: if you change this component, there's a high likelihood most
// integration tests will start failing too because they sniff the dom for the
// contents of this component.
//
// See TestUtils.js#assertFileWasRendered
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