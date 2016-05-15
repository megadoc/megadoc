const React = require('react');
const CollapsibleGroup = require('components/CollapsibleGroup');
const Heading = require('components/Heading');
const HighlightedText = require('components/HighlightedText');
const { shape, array, } = React.PropTypes;

const ExampleTags = React.createClass({
  propTypes: {
    doc: shape({
      tags: array,
    })
  },

  render() {
    const tags = this.props.doc.tags.filter(tag => tag.type === 'example');

    return (
      <div>
        {tags.length > 0 && (this.renderTags(tags))}
      </div>
    );
  },

  renderTags(tags) {
    return (
      <CollapsibleGroup>
        <CollapsibleGroup.Heading level="3">
          {tags.length > 1 ? 'Examples' : `Example${tags[0].name && ': ' + tags[0].name}`}
          <CollapsibleGroup.Collapser />
        </CollapsibleGroup.Heading>

        <CollapsibleGroup.Body>
          {tags.length === 1 ? (
            this.renderTag(tags[0], true)
          ) : (
            tags.map(this.renderTag)
          )}
        </CollapsibleGroup.Body>
      </CollapsibleGroup>
    )
  },

  renderTag(tag, dontShowHeading) {
    return (
      <div key={tag.name} className="lua-function__example">
        {dontShowHeading !== true && (
          <Heading level="4">
            <span className="lua-function__example-name">
              {tag.name || 'Example'}
            </span>
          </Heading>
        )}

        <HighlightedText className="lua-function__example-description">
          {tag.description}
        </HighlightedText>
      </div>
    );
  }
});

module.exports = ExampleTags;
