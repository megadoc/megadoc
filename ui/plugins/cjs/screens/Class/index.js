const React = require('react');
const Database = require('core/Database');
const ClassView = require('./ClassView');
const FunctionView = require('./FunctionView');
const HasTitle = require('mixins/HasTitle');
const ModuleHeader = require('./components/ModuleHeader');
const GitStats = require('components/GitStats');
const config = require('config');

const Class = React.createClass({
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

        {config.gitStats && (
          <GitStats {...doc.git} />
        )}
      </div>
    );
  }
});

module.exports = Class;