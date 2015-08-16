/* eslint "camelcase":0 */
var React = require("react");
var { findWhere, where } = require('lodash');
var config = require('config');
var MarkdownText = require('components/MarkdownText');
var Properties = require('./Properties');
var ArgumentTag = require('./tags/ArgumentTag');
var ExampleRequestTag = require('./tags/ExampleRequestTag');
var ExampleResponseTag = require('./tags/ExampleResponseTag');
var ReturnsTag = require('./tags/ReturnsTag');

var Header = React.createClass({
  propTypes: {
    showEndpointPath: React.PropTypes.bool,
    isBeta: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      showEndpointPath: config.showEndpointPath,
      isBeta: false
    };
  },

  render() {
    var { tag } = this.props;

    return (
      <h3 className="api-endpoint__header">
        <div className="api-endpoint__header-label">
          {tag.text}
          {this.props.isBeta && (
            <span className="api-endpoint__header-beta">
              BETA
            </span>
          )}

          {this.props.showEndpointPath && (
            <div className="api-endpoint__header-path">
              {this.props.path}
            </div>
          )}
        </div>
      </h3>
    );
  }
});

var TagGroup = React.createClass({
  render() {
    var tags = where(this.props.tags, { tag_name: this.props.tagName });
    var Renderer = this.props.renderer;

    if (tags.length === 0) {
      return null;
    }

    return (
      <div className={this.props.className}>
        {this.props.children}

        {tags.map(function(tag, i) {
          return <Renderer key={i} {...tag} />;
        })}
      </div>
    );
  }
});

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
  displayName: "APIEndpoint",

  render() {
    var method = this.props;
    var apiTag = findWhere(this.props.tags, { tag_name: 'API' });

    return (
      <div key={method.path} className="api-endpoint">
        <Header
          path={method.path}
          tag={apiTag}
          isBeta={!!findWhere(this.props.tags, { tag_name: 'beta' })}
        />

        <div className="api-endpoint__route">
          <span className="api-endpoint__route-verb">
            {method.route.verb}
          </span>

          {' '}

          {highlightDynamicFragments(method.route.path)}
        </div>

        <div className="api-endpoint__docstring">
          <MarkdownText>{method.docstring}</MarkdownText>
        </div>

        <h4>Arguments</h4>
        <Properties tags={where(this.props.tags, { tag_name: 'argument' })} />

        <TagGroup
          tagName="returns"
          tags={method.tags}
          renderer={ReturnsTag}
        />

        <TagGroup
          tagName="example_request"
          tags={method.tags}
          renderer={ExampleRequestTag}
          children={<h4>Example Requests</h4>}
        />

        <TagGroup
          tagName="example_response"
          tags={method.tags}
          renderer={ExampleResponseTag}
          children={<h4>Example Responses</h4>}
        />

        <pre>
          {JSON.stringify(method.tags.filter(function(tag) {
            return [
              'API',
              'beta',
              'example_response',
              'example_request',
              'returns',
              'argument'
            ].indexOf(tag.tag_name) === -1;
          }), null, 2)}
        </pre>
      </div>
    );
  },

  renderTag(tag) {
    var content = null;

    switch(tag.tag_name) {
      case 'argument':
        content = <ArgumentTag {...tag} />;
      break;
    }

    return content;
  }
});

module.exports = APIEndpoint;