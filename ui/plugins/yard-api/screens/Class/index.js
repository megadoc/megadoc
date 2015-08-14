var React = require("react");
var Database = require('core/Database');
var APIObject = require('./components/APIObject');
var APIEndpoint = require('./components/APIEndpoint');

var Class = React.createClass({
  render() {
    var codeObject = Database.getCodeObject(this.props.params.classId);

    return (
      <div className="doc-content">
        <h2>{codeObject.object}</h2>

        <div className="api-objects">
          <h3>API Objects</h3>

          {codeObject.api_objects.map(this.renderApiObject)}
        </div>

        <div className="api-endpoints">
          {codeObject.methods.map(this.renderMethod)}
        </div>
      </div>
    );
  },

  renderApiObject(entry) {
    return (
      <APIObject key={entry.controller} {...entry} />
    );
  },

  renderMethod(method) {
    return (
      <APIEndpoint key={method.path} {...method} />
    );
  }
});

module.exports = Class;