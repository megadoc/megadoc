const React = require('react');
const LinkResolver = require('core/LinkResolver');
const MarkdownText = require('components/MarkdownText');

const Types = React.createClass({
  propTypes: {
    types: React.PropTypes.arrayOf(React.PropTypes.string)
  },

  render() {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: this.props.types
        }}
      />
    );
  }
});

module.exports = Types;
