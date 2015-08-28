var React = require("react");
var Docstring = require('components/Docstring');

var ThrowsTag = React.createClass({
  propTypes: {
    types: React.PropTypes.arrayOf(React.PropTypes.string),
    description: React.PropTypes.string,
  },

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