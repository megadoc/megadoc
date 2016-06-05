const React = require("react");
const MarkdownText = require('components/MarkdownText');
const { shape, string } = React.PropTypes;

const SeeTag = React.createClass({
  propTypes: {
    typeInfo: shape({
      name: string.isRequired
    })
  },

  render() {
    return (
      <li className="see-tag">
        <MarkdownText tagName="span">{this.props.typeInfo.name}</MarkdownText>
      </li>
    );
  }
});

module.exports = SeeTag;