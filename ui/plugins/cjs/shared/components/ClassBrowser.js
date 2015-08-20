var React = require("react");
var { Link } = require('react-router');
var Database = require('core/Database');
var classSet = require('utils/classSet');
var Storage = require('core/Storage');
var Checkbox = require('components/Checkbox');
var HotItemIndicator = require('components/HotItemIndicator');
var { sortBy, groupBy } = require('lodash');
var isItemHot = require('utils/isItemHot');
var PRIVATE_VISIBILITY_KEY = require('constants').CFG_CLASS_BROWSER_SHOW_PRIVATE;
var BrowserJumperMixin = require('mixins/BrowserJumperMixin');

var ClassBrowser = React.createClass({
  mixins: [
    BrowserJumperMixin(function(props) {
      if (props.activeModuleId) {
        return this.refs[props.activeModuleId];
      }
    })
  ],

  render() {
    var modules = sortBy(this.props.modules, 'id');
    var nsClasses = groupBy(modules, 'namespace');

    var namespaces = Object.keys(nsClasses).map(function(ns) {
      return {
        name: ns === 'undefined' ? '[General]' : ns,
        modules: nsClasses[ns]
      };
    });

    namespaces = sortBy(namespaces, 'name');

    return (
      <nav className="class-browser__listing">
        {namespaces.map(this.renderNamespace)}

        <div className="class-browser__controls">
          <Checkbox
            checked={!!Storage.get(PRIVATE_VISIBILITY_KEY)}
            onChange={this.togglePrivateVisibility}
            children="Show private"
          />
        </div>
      </nav>
    );
  },

  renderNamespace(ns) {
    if (ns.modules.length === 0) {
      return null;
    }

    return (
      <div key={ns.name} className="class-browser__category">
        <h3 className="class-browser__category-name">
          {ns.name}
        </h3>

        {ns.modules.map(this.renderEntry)}
      </div>
    );
  },

  renderEntry(doc) {
    var { id } = doc;
    var isActive = this.props.activeModuleId === id;
    var className = classSet({
      'class-browser__entry': true,
      'class-browser__entry--active': isActive
    });

    var isPrivate = doc.isInternal || doc.isPrivate;

    if (isPrivate) {
      var showingPrivate = Storage.get(PRIVATE_VISIBILITY_KEY);

      if (!showingPrivate) {
        return null;
      }
    }

    return (
      <div key={id} className={className}>
        <Link ref={id} to="js.module" params={{ moduleId: id }} className="class-browser__entry-link">
          {doc.ctx.name}

          {isPrivate && (
            <span className="class-browser__entry-link--private"> (private)</span>
          )}

          {doc.git && isItemHot(doc.git.lastCommittedAt) && <HotItemIndicator />}
        </Link>

        {isActive && this.renderClassMethods(doc)}
      </div>
    );
  },

  renderClassMethods(moduleDoc) {
    var docs = Database.getModuleEntities(moduleDoc.id);

    if (!docs.length) {
      return null;
    }

    var methodDocs = docs.filter(function(doc) {
      return doc.ctx.type === 'method' || doc.isConstructor;
    });

    var propertyDocs = docs.filter(function(doc) {
      return doc.ctx.type === 'property';
    });

    return (
      <ul className="class-browser__methods">
        {sortBy(propertyDocs, 'id').map((doc) => {
          return this.renderClassEntity(moduleDoc, doc);
        })}

        {sortBy(methodDocs, 'id').map((doc) => {
          return this.renderClassEntity(moduleDoc, doc);
        })}
      </ul>
    );
  },

  renderClassEntity(moduleDoc, doc) {
    return (
      <li key={doc.id} className="class-browser__methods-entity">
        <Link
          to="js.module"
          params={{ moduleId: moduleDoc.id }}
          query={{ entity: doc.ctx.name }}
        >
          {doc.isConstructor ? 'constructor' : (doc.symbol + doc.ctx.name)}
        </Link>
      </li>
    );
  },

  togglePrivateVisibility() {
    Storage.set(PRIVATE_VISIBILITY_KEY, !Storage.get(PRIVATE_VISIBILITY_KEY));
  }
});

module.exports = ClassBrowser;