const React = require("react");
const MarkdownText = require('components/MarkdownText');
const APIObject = require('./APIObject');
const APIEndpoint = require('./APIEndpoint');
const APIEndpointRoute = require('./APIEndpoint__Route');
const Link = require('components/Link');
const { isAPIEndpoint, isAPIObject } = require('../utils');
const { Table, Row, Column } = require('components/IndexTable');
const { object } = React.PropTypes;

const APIResource = React.createClass({
  propTypes: {
    documentNode: object,
    config: object,
  },

  render() {
    const { documentNode } = this.props;
    const endpoints = documentNode.entities.filter(isAPIEndpoint);
    const objects = documentNode.entities.filter(isAPIObject);

    return (
      <div className="api-resource">
        <h1>{documentNode.title}</h1>

        <MarkdownText>{documentNode.properties.text}</MarkdownText>

        {this.renderQuickLinks({ endpoints, objects })}

        {objects.length > 0 && (
          <div className="api-resource__object-index">
            <h2>API Object Synopses</h2>
            <p>Below is a description of objects emitted or accepted by this API.</p>

            {objects.map(this.renderAPIObject)}
          </div>
        )}

        {endpoints.length > 0 && (
          <div className="api-endpoint-index">
            <h2>API Endpoint Documentation</h2>

            {endpoints.map(this.renderAPIEndpoint)}
          </div>
        )}
      </div>
    );
  },

  renderQuickLinks({ endpoints, objects }) {
    if (!endpoints.length && !objects.length) {
      return null;
    }

    return (
      <div>
        {endpoints.length > 0 && (
          <div>
            <h2>API Endpoints</h2>

            <Table>
              {endpoints.map(this.renderEndpointQuickLink)}
            </Table>
          </div>
        )}

        {objects.length > 0 && (
          <div>
            <h2>API Objects</h2>

            <ol>
              {objects.map(this.renderObjectQuickLink)}
            </ol>
          </div>
        )}
      </div>
    );
  },

  renderEndpointQuickLink(endpoint) {
    return (
      <Row key={endpoint.uid}>
        <Column>
          <Link to={endpoint.meta.href} children={endpoint.properties.title} />
        </Column>

        <Column>
          <APIEndpointRoute standalone route={endpoint.properties.route} />
        </Column>
      </Row>
    );
  },

  renderObjectQuickLink(documentNode) {
    return (
      <li key={documentNode.uid}>
        <Link to={documentNode.meta.href} children={documentNode.properties.title} />
      </li>
    );
  },

  renderAPIObject(documentNode) {
    return (
      <APIObject
        key={documentNode.uid}
        object={documentNode.properties}
        anchor={documentNode.meta.anchor}
      />
    );
  },

  renderAPIEndpoint(documentNode) {
    return (
      <APIEndpoint
        key={documentNode.uid}
        config={this.props.config}
        anchor={documentNode.meta.anchor}
        endpoint={documentNode.properties}
      />
    );
  }
});

module.exports = APIResource;