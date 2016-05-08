const React = require('react');
const ModuleBody = require('components/ModuleBody');
const HasTitle = require('mixins/HasTitle');
const ModuleHeader = require('components/ModuleHeader');
const GitStats = require('components/GitStats');
const Outlet = require('components/Outlet');

const Module = React.createClass({
  mixins: [
    HasTitle(function() {
      return this.props.documentNode.properties.name;
    })
  ],

  propTypes: {
    documentNode: React.PropTypes.object,
    namespaceNode: React.PropTypes.object,
  },

  render() {
    const { documentNode, namespaceNode } = this.props;
    const { config } = namespaceNode;
    const moduleNode = documentNode.type === 'DocumentEntity' ? documentNode.parentNode : documentNode;
    const moduleDoc = moduleNode.properties;
    const moduleDocs = moduleNode.entities.map(x => x.properties);
    const legacyParams = {
      moduleId: moduleNode.id,
      entity: documentNode.type === 'DocumentEntity' ? documentNode.id : undefined,
    };

    return (
      <div className="class-view doc-content">
        <ModuleHeader
          routeName={config.routeName}
          documentNode={moduleNode}
          doc={moduleDoc}
          moduleDocs={moduleDocs}
          showSourcePaths={config.showSourcePaths}
          showNamespace={config.showNamespaceInModuleHeader}
          generateAnchor={false}
        />

        <ModuleBody
          routeName={config.routeName}
          documentNode={moduleNode}
          doc={moduleDoc}
          moduleDocs={moduleDocs}
          focusedEntity={documentNode.type === 'DocumentEntity' ? documentNode.id : undefined}
        />

        <Outlet
          name="CJS::ModuleBody"
          elementProps={{
            routeName: config.routeName,
            params: legacyParams,
            query: {},
            moduleId: legacyParams.moduleId,
            moduleDoc: moduleDoc,
            moduleDocs: moduleDocs,
            document: moduleDoc,
          }}
        />

        {config.gitStats && (
          <GitStats {...doc.git} />
        )}
      </div>
    );
  }
});

module.exports = Module;