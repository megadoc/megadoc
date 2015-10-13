const React = require('react');
const LinkResolver = require('core/LinkResolver');
const MarkdownText = require('components/MarkdownText');

const Types = React.createClass({
  propTypes: {
    types: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  render() {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: this.props.types.join('|')
        }}
      />
    );
  }
});

module.exports = Types;
