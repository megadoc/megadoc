var React = require('react');
var MarkdownText = require('components/MarkdownText');

function htmlify(text) {
  return <MarkdownText>{text}</MarkdownText>;
}

function htmlifyTagType(tag) {
  // TODO: linkify
  return tag.types.join(', ');
}

var Properties = React.createClass({
  propTypes: {
    tags: React.PropTypes.arrayOf(React.PropTypes.shape({
      name: React.PropTypes.string,
      types: React.PropTypes.arrayOf(React.PropTypes.string),
      accepted_values: React.PropTypes.arrayOf(React.PropTypes.string),
      is_required: React.PropTypes.bool,
      text: React.PropTypes.string,
    })),
  },

  getDefaultProps: function() {
    return {
      tags: []
    };
  },

  render: function() {
    return (
      <ul className="argument-listing">
        {this.props.tags.map(this.renderArgument)}
      </ul>
    );
  },

  renderArgument(tag) {
    return (
      <li key={tag.name} className="argument-listing__argument">
        <div className="argument-listing__argument-details">
          <code className="argument-listing__argument-name">{tag.name}</code>

          <span className="argument-listing__argument-type">
            <MarkdownText>{tag.types.join('|')}</MarkdownText>
          </span>

          {(tag.accepted_values || []).length > 0 && (
            <span className="argument-listing__argument-values">
              <span>[ {tag.accepted_values.join(', ')} ]</span>
            </span>
          )}

          {tag.is_required && (
            <span className="argument-listing__argument-required">Required</span>
          )}
        </div>

        <div className="argument-listing__argument-text">
          {tag.text.length > 0 && (
            htmlify(tag.text)
          )}

          {tag.text.length === 0 && (
            <em className="type-mute">No description provided.</em>
          )}
        </div>
      </li>
    );
  }
});

module.exports = Properties;