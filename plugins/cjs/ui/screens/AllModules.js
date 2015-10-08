const React = require('react');
const Database = require('core/Database');
const ClassBrowser = require('components/ClassBrowser');
const Outlet = require('components/Outlet');
const ModuleBody = require('components/ModuleBody');
const ModuleHeader = require('components/ModuleHeader');
const jqScrollIntoView = require('jqScrollIntoView');

module.exports = function createAllModulesComponent(routeName) {
  const database = Database.for(routeName);

  return React.createClass({
    displayName: 'JSAllModules',

    propTypes: {
      query: React.PropTypes.object,
    },

    componentDidMount: function() {
      this.jumpIfNeeded();
    },

    componentDidUpdate: function(prevProps, prevState) {
      if (
        prevProps.params.moduleId !== this.props.params.moduleId ||
        JSON.stringify(prevProps.query) !== JSON.stringify(this.props.query)
      ) {
        this.jumpIfNeeded();
      }
    },

    jumpIfNeeded() {
      const { moduleId } = this.props.params;

      if (moduleId && this.refs[moduleId] && !this.props.query.entity) {
        jqScrollIntoView(React.findDOMNode(this.refs[moduleId]));
      }
    },

    render() {
      return (
        <div className="js-root">
          <div className="js-root__content">
            {database.getModules().map(this.renderModule)}
          </div>
        </div>
      );
    },

    renderModule(doc) {
      const moduleDocs = database.getModuleEntities(doc.id);

      return (
        <div key={doc.id} className="class-view doc-content">
          <ModuleHeader
            ref={doc.id}
            doc={doc}
            moduleDocs={moduleDocs}
            showSourcePaths={false}
          />

          <ModuleBody
            doc={doc}
            moduleDocs={moduleDocs}
            focusedEntity={this.props.params.moduleId === doc.id && this.props.query.entity}
          />
        </div>
      );
    }
  });
};