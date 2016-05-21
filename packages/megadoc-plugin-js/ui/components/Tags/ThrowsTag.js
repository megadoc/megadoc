const React = require("react");
const HighlightedText = require('components/HighlightedText');
const TypeNames = require('./TypeNames');

const { shape, string, object } = React.PropTypes;

const ThrowsTag = React.createClass({
  propTypes: {
    typeInfo: shape({
      type: object,
      description: string,
    }),
  },

  render() {
    return (
      <li className="throws-tag">
        <p className="inline-block">
          <TypeNames type={this.props.typeInfo.type} />
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