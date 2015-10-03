const React = require('react');
const Database = require('core/Database');
const ModuleBody = require('components/ModuleBody');
const HasTitle = require('mixins/HasTitle');
const ModuleHeader = require('components/ModuleHeader');
const GitStats = require('components/GitStats');
const config = require('config');
const Router = require('core/Router');

const Module = React.createClass({
  mixins: [
    HasTitle(function() {
      var module = Database.for(this.props.routeName).getModule(this.props.params.moduleId);
      if (module) {
        return `[JS] ${module.name}`;
      }
    })
  ],

  propTypes: {
    routeName: React.PropTypes.string,
    params: React.PropTypes.shape({
      moduleId: React.PropTypes.string
    }),
    query: React.PropTypes.shape({
      entity: React.PropTypes.string
    })
  },

  render() {
    const { routeName } = this.props;
    const { moduleId } = this.props.params;
    const doc = Database.for(routeName).getModule(moduleId);

    if (!doc) {
      Router.goToNotFound();
      return null;
    }

    const moduleDocs = Database.for(routeName).getModuleEntities(moduleId);

    if (process.env.NODE_ENV === 'development') {
      window.currentModule = doc;
      window.currentModuleDocs = moduleDocs;
    }

    return (
      <div className="class-view doc-content">
        <ModuleHeader
          doc={doc}
          moduleDocs={moduleDocs}
        />

        {(
          <ModuleBody
            doc={doc}
            moduleDocs={moduleDocs}
            focusedEntity={this.props.query.entity}
          />
        )}

        {config.for(routeName).gitStats && (
          <GitStats {...doc.git} />
        )}
      </div>
    );
  }
});

module.exports = Module;