const React = require("react");
const Link = require('components/Link');
const Checkbox = require('components/Checkbox');
const { isAPIObject, isAPIEndpoint } = require('../utils');
const { object } = React.PropTypes;

const APIClassBrowser = React.createClass({
  propTypes: {
    namespaceNode: object,
    documentNode: object,
  },

  getInitialState() {
    return {
      expanded: false
    }
  },

  render() {
    const resources = this.props.namespaceNode.documents;

    return (
      <nav>
        {resources.map(this.renderAPIResource)}

        {this.renderControls()}
      </nav>
    );
  },

  renderAPIResource(documentNode) {
    const objects = documentNode.entities.filter(isAPIObject);
    const endpoints = documentNode.entities.filter(isAPIEndpoint);

    return (
      <div key={documentNode.uid} className="class-browser__entry">
        <Link
          to={documentNode}
          children={documentNode.title}
          className="class-browser__entry-link"
        />

        {this.isExpanded(documentNode) && (
          <ul className="class-browser__sections">
            {objects.length > 0 && [
              <li key="h" className="class-browser__section-header">
                Objects
              </li>,

              <li key="l" className="class-browser__subsection">
                <ul className="class-browser__sections">
                  {objects.map(this.renderEntity)}
                </ul>
              </li>
            ]}

            {endpoints.length > 0 && [
              <li key="h" className="class-browser__section-header">
                Endpoints
              </li>,

              <li key="l" className="class-browser__subsection">
                <ul className="class-browser__sections">
                  {endpoints.map(this.renderEntity)}
                </ul>
              </li>
            ]}
          </ul>
        )}
      </div>
    );
  },

  renderEntity(documentNode) {
    return (
      <li key={documentNode.uid}>
        <Link to={documentNode} children={documentNode.title} />
      </li>
    );
  },

  renderControls() {
    return (
      <div className="class-browser__controls">
        <Checkbox
          checked={this.state.expanded}
          onChange={this.toggleExpandedState}
          children="Expand all resources"
        />
      </div>
    );
  },

  toggleExpandedState() {
    this.setState({ expanded: !this.state.expanded })
  },

  isExpanded(documentNode) {
    return this.state.expanded || (
      this.props.documentNode && this.props.documentNode.uid === documentNode.uid
    );
  }
});

module.exports = APIClassBrowser;