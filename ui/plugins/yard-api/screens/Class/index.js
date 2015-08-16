var React = require("react");
var Database = require('core/Database');
var APIObject = require('./components/APIObject');
var APIEndpoint = require('./components/APIEndpoint');

var Class = React.createClass({
  render() {
    var codeObject = Database.getCodeObject(this.props.params.classId);

    return (
      <div className="doc-content">
        <h1>{codeObject.object}</h1>

        {codeObject.api_objects.length > 0 && (
          <div className="api-objects">
            <h2>Object Synopses</h2>

            {codeObject.api_objects.map(this.renderApiObject)}
          </div>
        )}

        <div className="api-endpoints">
          {codeObject.methods.map(this.renderMethod)}
        </div>
      </div>
    );
  },

  renderApiObject(entry) {
    return (
      <APIObject key={[entry.controller, entry.name].join('')} {...entry} />
    );
  },

  renderMethod(method) {
    return (
      <APIEndpoint key={method.path} {...method} />
    );
  }
});

module.exports = Class;