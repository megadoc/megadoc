var React = require("react");
var Router = require('core/Router');
var Database = require('core/Database');
var MarkdownText = require('components/MarkdownText');
var APIObject = require('./components/APIObject');
var APIEndpoint = require('./components/APIEndpoint');
var { Link } = require('react-router');
var HasTitle = require('mixins/HasTitle');
const scrollToTop = require('utils/scrollToTop');

var APIResource = React.createClass({
  mixins: [
    HasTitle(function() {
      var resource = Database.getCodeObject(this.props.params.resourceId);

      if (resource) {
        return `[API] ${resource.title}`;
      }
    })
  ],

  propTypes: {
    params: React.PropTypes.shape({
      resourceId: React.PropTypes.string
    }),

    query: React.PropTypes.shape({
      endpoint: React.PropTypes.string,
      object: React.PropTypes.string,
    })
  },

  componentDidMount() {
    scrollToTop();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.params.resourceId !== this.props.params.resourceId) {
      scrollToTop();
    }
  },

  render() {
    var resource = Database.getCodeObject(this.props.params.resourceId);

    return (
      <div className="doc-content">
        <h1>{resource.title}</h1>

        <MarkdownText>{resource.text}</MarkdownText>

        {resource.endpoints.length > 0 && (
          this.renderQuickLinks(resource)
        )}

        {resource.objects.length > 0 && (
          <div className="api-objects">
            <h2>Object Synopses</h2>

            <p>Below is a description of the objects returned, or used, by this API.</p>

            {resource.objects.map(this.renderAPIObject)}
          </div>
        )}

        <div className="api-endpoints">
          {resource.endpoints.map(this.renderAPIEndpoint)}
        </div>
      </div>
    );
  },

  renderQuickLinks(resource) {
    return (
      <div>
        <h2>Endpoints</h2>

        <ul className="api-endpoint__quicklinks">
          {resource.endpoints.map(this.renderQuickLink)}
        </ul>
      </div>
    );
  },

  renderQuickLink(endpoint) {
    return (
      <li key={endpoint.id}>
        <Link
          to="yard-api.resource.endpoint"
          params={{
            resourceId: this.props.params.resourceId,
            endpointId: endpoint.scoped_id
          }}
          children={endpoint.title}
        />
      </li>
    );
  },

  renderAPIObject(object) {
    return (
      <APIObject
        key={object.id}
        object={object}
        anchorId={
          Router.generateAnchorId({
            routeName: "yard-api.resource.object",
            params: {
              resourceId: this.props.params.resourceId,
              objectId: object.scoped_id
            }
          })
        }
      />
    );
  },

  renderAPIEndpoint(endpoint) {
    return (
      <APIEndpoint
        key={endpoint.id}
        resourceId={this.props.params.resourceId}
        anchorId={
          Router.generateAnchorId({
            routeName: "yard-api.resource.endpoint",
            params: {
              resourceId: this.props.params.resourceId,
              endpointId: endpoint.scoped_id
            }
          })
        }
        endpoint={endpoint}
      />
    );
  }
});

module.exports = APIResource;