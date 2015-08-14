var React = require("react");
var MarkdownText = require('components/MarkdownText');

var ExampleRequestTag = React.createClass({
  displayName: "ExampleRequestTag",

  render() {
    return (
      <div className="example-request-tag">
        <MarkdownText>{'```javascript\n'+this.props.text+'\n```'}</MarkdownText>
      </div>
    );
  }
});

module.exports = ExampleRequestTag;