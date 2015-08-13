var React = require("react");
var config = require('config');
var MarkdownText = require('components/MarkdownText');

var Home = React.createClass({
  displayName: "Home",

  render() {
    return (
      <div className="doc-content">
        {config.readme ?
          <MarkdownText>{config.readme}</MarkdownText> :
          <p>Welcome to <strong>tiny</strong>doc!</p>
        }
      </div>
    );
  }
});

module.exports = Home;