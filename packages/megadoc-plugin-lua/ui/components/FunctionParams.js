const React = require('react');
const CollapsibleGroup = require('components/CollapsibleGroup');
const Heading = require('components/Heading');
const HighlightedText = require('components/HighlightedText');
const { shape, array, } = React.PropTypes;

const FunctionParams = React.createClass({
  propTypes: {
    doc: shape({
      tags: array,
    }),
  },

  render() {
    const paramTags = this.props.doc.tags.filter(tag => tag.type === 'param');

    return (
      <div>
        {paramTags.length > 0 && (this.renderParams(paramTags))}
      </div>
    );
  },

  renderParams(tags) {
    return (
      <CollapsibleGroup>
        <CollapsibleGroup.Heading level="3">
          Parameters
          <CollapsibleGroup.Collapser />
        </CollapsibleGroup.Heading>

        <CollapsibleGroup.Body>
          <ol>
            {tags.map(this.renderParam)}
          </ol>
        </CollapsibleGroup.Body>
      </CollapsibleGroup>
    )
  },

  renderParam(tag) {
    return (
      <li key={tag.name} className="lua-function__param">
        <Heading level="4">
          <span className="lua-function__param-name">
            {tag.name}
          </span>

          {': '}

          <code className="lua-function__param-type">
            {tag.typeInfo.types.join('|')}
          </code>
        </Heading>

        <HighlightedText className="lua-function__param-description">
          {tag.description}
        </HighlightedText>
      </li>
    )
  }
});

module.exports = FunctionParams;
