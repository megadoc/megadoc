const React = require('react');
const Database = require('core/Database');
const ModuleBody = require('components/ModuleBody');
const HasTitle = require('mixins/HasTitle');
const ModuleHeader = require('components/ModuleHeader');
const GitStats = require('components/GitStats');
const config = require('config');
const Router = require('core/Router');
const Outlet = require('components/Outlet');
const scrollToTop = require('utils/scrollToTop');

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
      moduleId: React.PropTypes.string,
      entity: React.PropTypes.string
    }),
    query: React.PropTypes.shape({
    })
  },

  componentDidMount: function() {
    scrollToTop();
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevProps.params.moduleId !== this.props.params.moduleId) {
      scrollToTop();
    }
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
          showSourcePaths={config.for(routeName).showSourcePaths}
        />

        <ModuleBody
          doc={doc}
          moduleDocs={moduleDocs}
          focusedEntity={decodeURIComponent(this.props.params.entity)}
        />

        <Outlet
          name="CJS::ModuleBody"
          props={{
            routeName: routeName,
            params: this.props.params,
            query: this.props.query,
            moduleId: moduleId,
            moduleDoc: doc,
            moduleDocs: moduleDocs,
          }}
        />

        {config.for(routeName).gitStats && (
          <GitStats {...doc.git} />
        )}
      </div>
    );
  }
});

module.exports = Module;