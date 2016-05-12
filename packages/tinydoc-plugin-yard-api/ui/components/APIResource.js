const React = require("react");
const Router = require('core/Router');
const Database = require('core/Database');
const MarkdownText = require('components/MarkdownText');
const APIObject = require('./APIObject');
const APIEndpoint = require('./APIEndpoint');
const APIEndpointRoute = require('./APIEndpoint__Route');
const Link = require('components/Link');
const HasTitle = require('mixins/HasTitle');
const scrollToTop = require('utils/scrollToTop');
const { refreshScroll } = require('core/Router');
const { isAPIEndpoint, isAPIObject } = require('utils');
const { Table, Row, Column } = require('components/IndexTable');

const APIResource = React.createClass({
  propTypes: {
    params: React.PropTypes.shape({
      resourceId: React.PropTypes.string,
      endpointId: React.PropTypes.string,
      objectId: React.PropTypes.string,
    }),
  },

  render() {
    const { documentNode } = this.props;

    return (
      <div className="doc-content">
        <h1>{documentNode.title}</h1>

        <MarkdownText>{documentNode.properties.text}</MarkdownText>

        {documentNode.entities.filter(isAPIEndpoint).length > 0 && (
          this.renderQuickLinks(documentNode)
        )}

        {documentNode.entities.filter(isAPIObject).length > 0 && (
          <div className="api-objects">
            <h2>Object Synopses</h2>

            <p>Below is a description of objects emitted or accepted by this API.</p>

            {documentNode.entities.filter(isAPIObject).map(this.renderAPIObject)}
          </div>
        )}

        <div className="api-endpoints">
          {documentNode.entities.filter(isAPIEndpoint).map(this.renderAPIEndpoint)}
        </div>
      </div>
    );
  },

  renderQuickLinks(documentNode) {
    return (
      <div>
        <h2>Endpoints</h2>

        <Table>
          {documentNode.entities.filter(isAPIEndpoint).map(this.renderEndpointQuickLink)}
        </Table>

        <h2>Objects</h2>

        <ol>
          {documentNode.entities.filter(isAPIObject).map(this.renderQuickLink)}
        </ol>
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

  renderQuickLink(object) {
    return (
      <li key={object.uid}>
        <Link to={object.meta.href} children={object.properties.title} />
      </li>
    );
  },

  renderAPIObject(documentNode) {
    return (
      <APIObject
        key={documentNode.uid}
        object={documentNode.properties}
        config={this.props.config}
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