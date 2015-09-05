var React = require("react");
var Docstring = require('components/Docstring');

var ThrowsTag = React.createClass({
  displayName: "ThrowsTag",

  render() {
    return (
      <li className="throws-tag">
        <Docstring>
          `{this.props.types.join(', ')}` -

          {this.props.description.trim()}
        </Docstring>
      </li>
    );
  }
});

module.exports = ThrowsTag;