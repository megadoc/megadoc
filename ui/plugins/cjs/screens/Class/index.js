var React = require('react');
var Database = require('core/Database');
var ClassView = require('./ClassView');
var FunctionView = require('./FunctionView');
var HasTitle = require('mixins/HasTitle');
var ModuleHeader = require('./components/ModuleHeader');

var Class = React.createClass({
  mixins: [
    HasTitle(function() {
      var module = Database.getModule(this.props.params.moduleId);
      if (module) {
        return `[JS] ${module.ctx.name}`;
      }
    })
  ],

  statics: {
    willTransitionTo(transition, params) {
      if (!Database.getModule(params.moduleId)) {
        transition.redirect('js');
      }
    }
  },

  render() {
    const { moduleId } = this.props.params;
    const doc = Database.getModule(moduleId);
    const moduleDocs = Database.getModuleEntities(moduleId);

    return (
      <div className="class-view doc-content">
        <ModuleHeader doc={doc} commonPrefix={Database.getCommonPrefix()} />

        {doc.isFunction ? (
          <FunctionView
            doc={doc}
            moduleDocs={moduleDocs}
            focusedEntity={this.props.query.entity}
          />
        ) : (
          <ClassView
            doc={doc}
            moduleDocs={moduleDocs}
            focusedEntity={this.props.query.entity}
          />
        )}
      </div>
    );
  }
});

module.exports = Class;