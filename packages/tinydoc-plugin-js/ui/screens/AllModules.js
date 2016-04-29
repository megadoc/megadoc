const React = require('react');
const Database = require('core/Database');
const Outlet = require('components/Outlet');
const ModuleBody = require('components/ModuleBody');
const ModuleHeader = require('components/ModuleHeader');

const { shape, string, object } = React.PropTypes;

module.exports = function createAllModulesComponent(routeName, config) {
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
      query: object,
    },

    shouldComponentUpdate: function(nextProps) {
      if (nextProps.query !== this.props.query) {
        maybeUpdate(this, this.props.params.moduleId);
        maybeUpdate(this, nextProps.params.moduleId);

        return true;
      }
      else if (nextProps.params.moduleId !== this.props.params.moduleId) {
        maybeUpdate(this, this.props.params.moduleId);
        maybeUpdate(this, nextProps.params.moduleId);

        return false;
      }
      else if (nextProps.params.entity !== this.props.params.entity) {
        maybeUpdate(this, nextProps.params.moduleId);

        return false;
      }
      else {
        return false;
      }
    },

    render() {
      return (
        <div className="js-root js-all-modules">
          {config.navigationLabel && (
            <header className="js-all-modules__header">
              {config.navigationLabel}
            </header>
          )}

          <div className="js-root__content">
            {database.getNamespacedModules().map(this.renderNamespace)}
          </div>
        </div>
      );
    },

    renderNamespace(ns) {
      return (
        <div key={ns.name} className="js-all-modules__namespace">
          {database.hasNamespaces() && (
            <header className="js-all-modules__namespace-header">{ns.name}</header>
          )}

          {ns.module && this.renderModule(ns.module, true)}
          {ns.modules.map(this.renderModule)}
        </div>
      )
    },

    renderModule(doc, renderNamespaceModule = false) {
      if (doc.$isNamespaceModule && renderNamespaceModule !== true) {
        return null;
      }

      const moduleDocs = database.getModuleEntities(doc.id);

      return (
        <div key={doc.id} className="class-view doc-content">
          <ModuleHeader
            routeName={routeName}
            doc={doc}
            moduleDocs={moduleDocs}
            showSourcePaths
            showNamespace
            headerLevel="1"
          />

          <ModuleBody
            ref={doc.id}
            doc={doc}
            routeName={routeName}
            moduleDocs={moduleDocs}
          />

          <Outlet
            name="CJS::ModuleBody"
            elementProps={{
              routeName: routeName,
              params: this.props.params,
              query: this.props.query,
              moduleDoc: doc,
              moduleDocs: moduleDocs,
              document: doc,
            }}
          />

        </div>
      );
    },
  });
};