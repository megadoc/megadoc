const React = require('react');
const Database = require('core/Database');
const ModuleBody = require('components/ModuleBody');
const HasTitle = require('mixins/HasTitle');
const ModuleHeader = require('components/ModuleHeader');
const GitStats = require('components/GitStats');
const config = require('config');

const Module = React.createClass({
  mixins: [
    HasTitle(function() {
      var module = Database.getModule(this.props.params.moduleId);
      if (module) {
        return `[JS] ${module.name}`;
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

  propTypes: {
    params: React.PropTypes.shape({
      moduleId: React.PropTypes.string
    }),
    query: React.PropTypes.shape({
      entity: React.PropTypes.string
    })
  },

  render() {
    const { moduleId } = this.props.params;
    const doc = Database.getModule(moduleId);
    const moduleDocs = Database.getModuleEntities(moduleId);

    if (process.env.NODE_ENV === 'development') {
      window.currentModule = doc;
      window.currentModuleDocs = moduleDocs;
    }

    return (
      <div className="class-view doc-content">
        <ModuleHeader
          doc={doc}
          moduleDocs={moduleDocs}
          commonPrefix={Database.getCommonPrefix()}
        />

        {(
          <ModuleBody
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

module.exports = Module;