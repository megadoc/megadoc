const React = require("react");
const { findWhere, where } = require('lodash');
const ErrorMessage = require('components/ErrorMessage');
const HighlightedText = require('components/HighlightedText');
const PropertyListing = require('./PropertyListing');
const ExampleRequestTag = require('./ExampleRequestTag');
const ExampleResponseTag = require('./ExampleResponseTag');
const ReturnsTag = require('./ReturnsTag');
const Header = require('./APIEndpoint__Header');
const TagGroup = require('./APIEndpoint__TagGroup');
const Route = require('./APIEndpoint__Route');
const { shape, string, arrayOf, object, } = React.PropTypes;

const APIEndpoint = React.createClass({
  propTypes: {
    anchor: string,
    config: object,

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
        <Header
          path={endpoint.id}
          tag={apiTag}
          isBeta={!!findWhere(endpoint.tags, { tag_name: 'beta' })}
          anchor={this.props.anchor}
          showEndpointPath={this.props.config.showEndpointPath}
        />

        <Route route={endpoint.route} />

        <div className="api-endpoint__docstring">
          <HighlightedText>{endpoint.text}</HighlightedText>
        </div>

        <PropertyListing tags={where(endpoint.tags, { tag_name: 'argument' })}>
          <h4>Arguments</h4>
        </PropertyListing>

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
          <ErrorMessage>
            <p>Unrecognized tags:</p>

            <pre>
              {JSON.stringify(unhandledTags, null, 2)}
            </pre>
          </ErrorMessage>
        )}
      </div>
    );
  }
});

module.exports = APIEndpoint;


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
