var React = require("react");
var MarkdownText = require('components/MarkdownText');

var APIObject = React.createClass({
  displayName: "APIObject",

  render() {
    return(
      <div>
        <h4>{this.props.name}</h4>

        <MarkdownText>{'```javascript\n'+this.props.schema+'\n```'}</MarkdownText>
      </div>
    );
  }
});

module.exports = APIObject;