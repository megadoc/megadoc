const React = require("react");
const HighlightedText = require('components/HighlightedText');
const Types = require('components/Tags/Types');

const { shape, string, arrayOf } = React.PropTypes;

const ThrowsTag = React.createClass({
  propTypes: {
    typeInfo: shape({
      types: arrayOf(string),
      description: string,
    }),
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