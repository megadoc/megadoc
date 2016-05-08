const React = require('react');
const Database = require('core/Database');
const ModuleBody = require('components/ModuleBody');
const HasTitle = require('mixins/HasTitle');
const ModuleHeader = require('components/ModuleHeader');
const GitStats = require('components/GitStats');
const NotFound = require('components/NotFound');
const config = require('config');
const Outlet = require('components/Outlet');
const scrollToTop = require('utils/scrollToTop');

const Module = React.createClass({
  mixins: [
    HasTitle(function() {
      var module = Database.for(this.props.routeName).getModule(this.props.params.moduleId);
      if (module) {
        return module.name;
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

  componentDidUpdate: function(prevProps) {
    if (prevProps.params.moduleId !== this.props.params.moduleId) {
      scrollToTop();
    }
  },

  render() {
    const { routeName } = this.props;
    const { moduleId } = this.props.params;
    const documentNode = Database.for(routeName).getModule(moduleId);

    if (!documentNode) {
      return <NotFound />;
    }

    const doc = documentNode.properties;
    const moduleDocs = documentNode.entities.map(x => x.properties);

    return (
      <div className="class-view doc-content">
        <ModuleHeader
          routeName={routeName}
          documentNode={documentNode}
          doc={doc}
          moduleDocs={moduleDocs}
          showSourcePaths={config.for(routeName).showSourcePaths}
          showNamespace={config.for(routeName).showNamespaceInModuleHeader}
          generateAnchor={false}
        />

        <ModuleBody
          routeName={routeName}
          documentNode={documentNode}
          doc={doc}
          moduleDocs={moduleDocs}
          focusedEntity={decodeURIComponent(this.props.params.entity)}
        />

        <Outlet
          name="CJS::ModuleBody"
          elementProps={{
            routeName: routeName,
            params: this.props.params,
            query: this.props.query,
            moduleId: moduleId,
            moduleDoc: doc,
            moduleDocs: moduleDocs,
            document: doc,
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