const React = require('react');
const ModuleBody = require('./ModuleBody');
const HasTitle = require('mixins/HasTitle');
const ModuleHeader = require('./ModuleHeader');
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
    const moduleNode = documentNode.type === 'DocumentEntity' ?
      documentNode.parentNode :
      documentNode
    ;

    const legacyParams = {
      moduleId: moduleNode.id,
      entity: documentNode.type === 'DocumentEntity' ? documentNode.id : undefined,
    };

    return (
      <div className="class-view doc-content">
        <ModuleHeader
          routeName={config.routeName}
          documentNode={moduleNode}
          showSourcePaths={config.showSourcePaths}
          showNamespace={config.showNamespaceInModuleHeader}
          generateAnchor={false}
        />

        <ModuleBody
          routeName={config.routeName}
          documentNode={moduleNode}
          focusedEntity={documentNode.type === 'DocumentEntity' ? documentNode.id : undefined}
        />

        <Outlet
          name="CJS::ModuleBody"
          elementProps={{
            params: legacyParams,
            query: {},
            documentNode,
            namespaceNode,
          }}
        />
      </div>
    );
  }
});

module.exports = Module;