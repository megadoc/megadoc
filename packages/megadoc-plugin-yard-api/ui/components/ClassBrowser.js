const React = require("react");
const Link = require('components/Link');
const Checkbox = require('components/Checkbox');
const Storage = require('core/Storage');
const EXPAND_ALL = require('../constants').CFG_CLASS_BROWSER_EXPAND_ALL;
const { isAPIObject, isAPIEndpoint } = require('../utils');
const { object } = React.PropTypes;

const APIClassBrowser = React.createClass({
  propTypes: {
    namespaceNode: object,
    documentNode: object,
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
          checked={!!Storage.get(EXPAND_ALL)}
          onChange={this.toggleExpandedState}
          children="Expand all resources"
        />
      </div>
    );
  },

  toggleExpandedState() {
    Storage.set(EXPAND_ALL, !Storage.get(EXPAND_ALL));
  },

  isExpanded(documentNode) {
    return Storage.get(EXPAND_ALL) || (
      this.props.documentNode && this.props.documentNode.uid === documentNode.uid
    );
  }
});

module.exports = APIClassBrowser;