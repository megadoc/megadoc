var React = require("react");
var Database = require('core/Database');
var MarkdownText = require('components/MarkdownText');
var APIObject = require('./components/APIObject');
var APIEndpoint = require('./components/APIEndpoint');
var JumperMixin = require('mixins/JumperMixin');
var { Link } = require('react-router');
var HasTitle = require('mixins/HasTitle');

var APIResource = React.createClass({
  mixins: [
    HasTitle(function() {
      var resource = Database.getCodeObject(this.props.params.resourceId);

      if (resource) {
        return `[API] ${resource.title}`;
      }
    }),

    JumperMixin(function() {
      if (this.props.query.endpoint) {
        return this.refs[`endpoint-${this.props.query.endpoint}`];
      }
      else if (this.props.query.object) {
        return this.refs[`object-${this.props.query.object}`];
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
          {resource.endpoints.map((e) => {
            return (
              <li key={e.id}>
                <Link
                  to="api.resource"
                  params={{ resourceId: resource.id }}
                  query={{ endpoint: e.scoped_id }}
                >
                  {e.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },

  renderAPIObject(object) {
    return (
      <APIObject
        ref={`object-${object.scoped_id}`}
        key={object.id} {...object}
      />
    );
  },

  renderAPIEndpoint(endpoint) {
    return (
      <APIEndpoint
        ref={`endpoint-${endpoint.scoped_id}`}
        key={endpoint.id}
        resourceId={this.props.params.resourceId}
        {...endpoint}
      />
    );
  }
});

module.exports = APIResource;