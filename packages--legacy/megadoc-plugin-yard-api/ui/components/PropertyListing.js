const React = require('react');
const MarkdownText = require('components/MarkdownText');
const { arrayOf, shape, string, bool, node } = React.PropTypes;

const Properties = React.createClass({
  propTypes: {
    tags: arrayOf(shape({
      name: string,
      types: arrayOf(string),
      accepted_values: arrayOf(string),
      is_required: bool,
      text: string,
    })),

    children: node,
  },

  getDefaultProps() {
    return {
      tags: []
    };
  },

  render() {
    if (!this.props.tags || !this.props.tags.length) {
      return null;
    }

    return (
      <div>
        {this.props.children}

        <ul className="argument-listing">
          {this.props.tags.map(this.renderArgument)}
        </ul>
      </div>
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
            <MarkdownText>{tag.text}</MarkdownText>
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