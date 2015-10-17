const React = require('react');
const Database = require('core/Database');
const ModuleBody = require('components/ModuleBody');
const ModuleHeader = require('components/ModuleHeader');

const { shape, string } = React.PropTypes;

module.exports = function createAllModulesComponent(routeName) {
  const database = Database.for(routeName);
  const modules = database.getModules().map(function(doc) {
    return {
      doc: doc,
      moduleDocs: database.getModuleEntities(doc.id)
    };
  });

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
      console.debug('Rendering');

      return (
        <div className="js-root">
          <div className="js-root__content">
            {modules.map(this.renderModule)}
          </div>
        </div>
      );
    },

    renderModule({ doc, moduleDocs }) {
      return (
        <div key={doc.id} className="class-view doc-content">
          <ModuleHeader
            routeName={routeName}
            doc={doc}
            moduleDocs={moduleDocs}
            showSourcePaths={false}
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