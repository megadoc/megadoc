const React = require('react');
const CollapsibleGroup = require('components/CollapsibleGroup');
const Heading = require('components/Heading');
const HighlightedText = require('components/HighlightedText');
const { shape, array, } = React.PropTypes;

const FunctionReturns = React.createClass({
  propTypes: {
    doc: shape({
      tags: array,
    }),
  },

  render() {
    const returnTags = this.props.doc.tags.filter(tag => tag.type === 'return');

    return (
      <div>
        {returnTags.length > 0 && (this.renderReturns(returnTags))}
      </div>
    );
  },

  renderReturns(tags) {
    return (
      <CollapsibleGroup>
        <CollapsibleGroup.Heading level="3">
          Return Values
          <CollapsibleGroup.Collapser />
        </CollapsibleGroup.Heading>

        <CollapsibleGroup.Body>
          <ol>
            {tags.map(this.renderReturnTag)}
          </ol>
        </CollapsibleGroup.Body>
      </CollapsibleGroup>
    )
  },

  renderReturnTag(tag) {
    const key = tag.name + tag.typeInfo.types.join('');

    return (
      <li key={key} className="lua-function__param">
        <Heading level="4">
          {tag.name && (
            <span>
              <span className="lua-function__param-name">
                {tag.name}
              </span>

              {': '}
            </span>
          )}

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

module.exports = FunctionReturns;
