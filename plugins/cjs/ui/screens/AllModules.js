const React = require('react');
const Database = require('core/Database');
const ModuleBody = require('components/ModuleBody');
const ModuleHeader = require('components/ModuleHeader');

const { shape, string } = React.PropTypes;

module.exports = function createAllModulesComponent(routeName) {
  const database = Database.for(routeName);

  function maybeUpdate(component, moduleId) {
    if (component.refs[moduleId]) {
      component.refs[moduleId].forceUpdate();
    }
  }

  return React.createClass({
    displayName: 'JSAllModules',

    propTypes: {
      params: shape({
        moduleId: string,
        entity: string,
      }),
    },

    shouldComponentUpdate: function(nextProps) {
      if (nextProps.params.moduleId !== this.props.params.moduleId) {
        maybeUpdate(this, this.props.params.moduleId);
        maybeUpdate(this, nextProps.params.moduleId);
      }
      else if (nextProps.params.entity !== this.props.params.entity) {
        maybeUpdate(this, nextProps.params.moduleId);
      }

      return false;
    },

    render() {
      return (
        <div className="js-root js-all-modules">
          <div className="js-root__content">
            {database.getNamespacedModules().map(this.renderNamespace)}
          </div>
        </div>
      );
    },

    renderNamespace(ns) {
      return (
        <div key={ns.name} className="js-all-modules__namespace">
          <header className="js-all-modules__namespace-header">{ns.name}</header>

          {ns.modules.map(this.renderModule)}
        </div>
      )
    },

    renderModule(doc) {
      const moduleDocs = database.getModuleEntities(doc.id);

      return (
        <div key={doc.id} className="class-view doc-content">
          <ModuleHeader
            routeName={routeName}
            doc={doc}
            moduleDocs={moduleDocs}
            showSourcePaths={false}
            showNamespace
            headerLevel="1"
          />

          <ModuleBody
            ref={doc.id}
            doc={doc}
            routeName={routeName}
            moduleDocs={moduleDocs}
          />
        </div>
      );
    },
  });
};