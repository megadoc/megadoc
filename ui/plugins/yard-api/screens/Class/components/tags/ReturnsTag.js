var React = require("react");
var Docstring = require('components/Docstring');

var ReturnsTag = React.createClass({
  displayName: "ReturnsTag",

  render() {
    return(
      <p>
        <Docstring>Returns {this.props.text}</Docstring>
      </p>
    );
  }
});

module.exports = ReturnsTag;