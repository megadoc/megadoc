var React = require("react");
var HighlightedText = require('components/HighlightedText');
var Types = require('components/Tags/Types');

var ThrowsTag = React.createClass({
  propTypes: {
    types: React.PropTypes.arrayOf(React.PropTypes.string),
    description: React.PropTypes.string,
  },

  render() {
    return (
      <li className="throws-tag">
        <p className="inline-block">
          <Types types={this.props.typeInfo.types} />
        </p>

        {' - '}

        <HighlightedText
          className="inline-block"
          children={this.props.typeInfo.description}
        />
      </li>
    );
  }
});

module.exports = ThrowsTag;