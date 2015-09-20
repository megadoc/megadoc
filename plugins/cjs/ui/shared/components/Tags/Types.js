const React = require('react');
const LinkResolver = require('core/LinkResolver');
const MarkdownText = require('components/MarkdownText');

const Types = React.createClass({
  propTypes: {
    types: React.PropTypes.arrayOf(React.PropTypes.string)
  },

  render() {
    let types = this.props.types.map(function(type) {
      return LinkResolver.linkify(`[${type}]()`, false);
    }).join(', ');

    return (
      <span dangerouslySetInnerHTML={{
        __html: MarkdownText.renderMarkdown(types)
          .replace('<p>', '')
          .replace('</p>', '')
        }}
      />
    );
  }
});

module.exports = Types;
