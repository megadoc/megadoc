var React = require("react");
var { Link } = require('react-router');
var Checkbox = require('components/Checkbox');
var Storage = require('core/Storage');
var EXPAND_ALL = require('constants').CFG_CLASS_BROWSER_EXPAND_ALL;

var APIClassBrowser = React.createClass({
  render() {
    return (
      <nav>
        {this.props.objects.map(this.renderAPIEntry)}

        {this.renderControls()}
      </nav>
    );
  },

  renderAPIEntry(resource) {
    return (
      <div key={resource.id} className="class-browser__entry">
        <Link
          to="api.resource"
          params={{ resourceId: resource.id }}
          children={resource.title}
          className="class-browser__entry-link"
        />

        {this.isExpanded(resource) && (
          <ul className="class-browser__sections">
            {resource.objects.length > 0 && [
              <li key="h" className="class-browser__section-header">
                Objects
              </li>,

              <li key="l" className="class-browser__subsection">
                <ul className="class-browser__sections">
                  {resource.objects.map(this.renderObject.bind(null, resource))}
                </ul>
              </li>
            ]}

            {resource.endpoints.length > 0 && [
              <li key="h" className="class-browser__section-header">
                Endpoints
              </li>,

              <li key="l" className="class-browser__subsection">
                <ul className="class-browser__sections">
                  {resource.endpoints.map(this.renderEndpoint.bind(null, resource))}
                </ul>
              </li>
            ]}
          </ul>
        )}
      </div>
    );
  },

  renderObject(resource, object) {
    return (
      <li key={object.id}>
        <Link
          to="api.resource"
          params={{ resourceId: resource.id }}
          query={{ object: object.scoped_id }}
          children={object.title}
        />
      </li>
    );
  },

  renderEndpoint(resource, endpoint) {
    return (
      <li key={endpoint.id}>
        <Link
          to="api.resource"
          params={{ resourceId: resource.id }}
          query={{ endpoint: endpoint.scoped_id }}
          children={endpoint.title}
        />
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

  isExpanded(resource) {
    return Storage.get(EXPAND_ALL) || this.props.activeResourceId === resource.id;
  }
});

module.exports = APIClassBrowser;