/* eslint "camelcase":0 */
var React = require("react");
var { findWhere, where } = require('lodash');
var MarkdownText = require('components/MarkdownText');
var PropertyListing = require('./PropertyListing');
var ExampleRequestTag = require('./tags/ExampleRequestTag');
var ExampleResponseTag = require('./tags/ExampleResponseTag');
var ReturnsTag = require('./tags/ReturnsTag');
var Header = require('./APIEndpoint/Header');
var TagGroup = require('./APIEndpoint/TagGroup');

function highlightDynamicFragments(route) {
  var fragments = route.split('/');

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

var APIEndpoint = React.createClass({
  propTypes: {
    tags: React.PropTypes.array,
    resourceId: React.PropTypes.string,
    scoped_id: React.PropTypes.string,
  },

  render() {
    var endpoint = this.props;
    var apiTag = findWhere(this.props.tags, { tag_name: 'API' });
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
          isBeta={!!findWhere(this.props.tags, { tag_name: 'beta' })}
          resourceId={this.props.resourceId}
          scopedId={this.props.scoped_id}
        />

        <div className="api-endpoint__route">
          <span className="api-endpoint__route-verb">
            {endpoint.route.verb}
          </span>

          {' '}

          {highlightDynamicFragments(endpoint.route.path)}
        </div>

        <div className="api-endpoint__docstring">
          <MarkdownText>{endpoint.text}</MarkdownText>
        </div>

        <h4>Arguments</h4>
        <PropertyListing tags={where(this.props.tags, { tag_name: 'argument' })} />

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