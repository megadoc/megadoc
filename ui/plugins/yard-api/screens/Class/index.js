var React = require("react");
var Database = require('core/Database');
var MarkdownText = require('components/MarkdownText');
var APIObject = require('./components/APIObject');
var APIEndpoint = require('./components/APIEndpoint');
var SectionJumperMixin = require('mixins/SectionJumperMixin');

var Class = React.createClass({
  mixins: [
    SectionJumperMixin(function() {
      if (this.props.query.endpoint) {
        return this.refs[`endpoint-${this.props.query.endpoint}`];
      }
      else if (this.props.query.object) {
        return this.refs[`object-${this.props.query.object}`];
      }
    })
  ],

  render() {
    var resource = Database.getCodeObject(this.props.params.resourceId);

    return (
      <div className="doc-content">
        <h1>{resource.title}</h1>

        <MarkdownText>{resource.text}</MarkdownText>

        {resource.objects.length > 0 && (
          <div className="api-objects">
            <h2>Object Synopses</h2>

            {resource.objects.map(this.renderAPIObject)}
          </div>
        )}

        <div className="api-endpoints">
          {resource.endpoints.map(this.renderAPIEndpoint)}
        </div>
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
        {...endpoint}
      />
    );
  }
});

module.exports = Class;