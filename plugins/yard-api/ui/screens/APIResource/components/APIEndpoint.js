/* eslint "camelcase":0 */
const React = require("react");
const { findWhere, where } = require('lodash');
const HighlightedText = require('components/HighlightedText');
const PropertyListing = require('./PropertyListing');
const ExampleRequestTag = require('./tags/ExampleRequestTag');
const ExampleResponseTag = require('./tags/ExampleResponseTag');
const ReturnsTag = require('./tags/ReturnsTag');
const Header = require('./APIEndpoint/Header');
const TagGroup = require('./APIEndpoint/TagGroup');

function highlightDynamicFragments(route) {
  const fragments = route.split('/');

  return fragments.map(function(fragment, index) {
    return (
      <span key={fragment}>
        {fragment.match(/^:[\w|_]+$/) ? (
          <span className="api-endpoint__route-dynamic-fragment">
            {fragment}
          </span>
        ) : (
          fragment
        )}

        {index !== fragments.length-1 && '/'}
      </span>
    );
  });
}

const { shape, string, node, arrayOf } = React.PropTypes;

const APIEndpoint = React.createClass({
  propTypes: {
    anchor: node,

    endpoint: shape({
      id: string,
      scoped_id: string,
      text: string,

      tags: arrayOf(shape({
        tag_name: string,
      })),

      route: shape({
        verb: string,
        path: string,
      })
    }),

    resourceId: React.PropTypes.string,
    scoped_id: React.PropTypes.string,
  },

  render() {
    var endpoint = this.props.endpoint;
    var apiTag = findWhere(endpoint.tags, { tag_name: 'API' });
    var unhandledTags = endpoint.tags.filter(function(tag) {
      return [
        'API',
        'beta',
        'example_response',
        'example_request',
        'returns',
        'argument'
      ].indexOf(tag.tag_name) === -1;
    });

    return (
      <div key={endpoint.id} className="api-endpoint">
        {this.props.anchor || null}

        <Header
          path={endpoint.id}
          tag={apiTag}
          isBeta={!!findWhere(endpoint.tags, { tag_name: 'beta' })}
          resourceId={this.props.resourceId}
          scopedId={endpoint.scoped_id}
        />

        <div className="api-endpoint__route">
          <span className="api-endpoint__route-verb">
            {endpoint.route.verb}
          </span>

          {' '}

          {highlightDynamicFragments(endpoint.route.path)}
        </div>

        <div className="api-endpoint__docstring">
          <HighlightedText>{endpoint.text}</HighlightedText>
        </div>

        <h4>Arguments</h4>
        <PropertyListing tags={where(endpoint.tags, { tag_name: 'argument' })} />

        <TagGroup
          tagName="returns"
          tags={endpoint.tags}
          renderer={ReturnsTag}
        />

        <TagGroup
          tagName="example_request"
          tags={endpoint.tags}
          renderer={ExampleRequestTag}
          children={<h4>Example Requests</h4>}
        />

        <TagGroup
          tagName="example_response"
          tags={endpoint.tags}
          renderer={ExampleResponseTag}
          children={<h4>Example Responses</h4>}
        />

        {unhandledTags.length > 0 && (
          <pre>
            {JSON.stringify(unhandledTags, null, 2)}
          </pre>
        )}
      </div>
    );
  }
});

module.exports = APIEndpoint;