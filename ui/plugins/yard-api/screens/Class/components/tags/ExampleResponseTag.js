var React = require("react");
var MarkdownText = require('components/MarkdownText');

var ExampleResponseTag = React.createClass({
  displayName: "ExampleResponseTag",

  render() {
    return (
      <div className="example-response-tag">
        <MarkdownText>{'```javascript\n'+this.props.text+'\n```'}</MarkdownText>
      </div>
    );
  }
});

module.exports = ExampleResponseTag;