var React = require("react");
var MarkdownText = require('components/MarkdownText');

var ExampleRequestTag = React.createClass({
  propTypes: {
    text: React.PropTypes.string
  },

  render() {
    return (
      <div className="example-request-tag">
        <MarkdownText>{'```javascript\n'+this.props.text+'\n```'}</MarkdownText>
      </div>
    );
  }
});

module.exports = ExampleRequestTag;