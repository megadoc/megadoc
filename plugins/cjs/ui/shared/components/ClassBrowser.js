const React = require("react");
const Link = require('components/Link');
const Database = require('core/Database');
const classSet = require('utils/classSet');
const Storage = require('core/Storage');
const Checkbox = require('components/Checkbox');
const HotItemIndicator = require('components/HotItemIndicator');
const { findWhere } = require('lodash');
const isItemHot = require('utils/isItemHot');
const K = require('constants');
const PRIVATE_VISIBILITY_KEY = K.CFG_CLASS_BROWSER_SHOW_PRIVATE;
const JumperMixin = require('mixins/JumperMixin');
const orderAwareSort = require('utils/orderAwareSort');

var ClassBrowser = React.createClass({
  mixins: [
    JumperMixin(function(props) {
      if (props.activeModuleId) {
        return this.refs[props.activeModuleId];
      }
      else {
        return false;
      }
    }, 50)
  ],

  propTypes: {
    routeName: React.PropTypes.string.isRequired,
    activeModuleId: React.PropTypes.string,
    activeEntityId: React.PropTypes.string,
    withControls: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      withControls: true
    };
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    return (
      nextProps.routeName !== this.props.routeName ||
      nextProps.activeModuleId !== this.props.activeModuleId ||
      nextProps.activeEntityId !== this.props.activeEntityId
    );
  },


  render() {
    console.log('[CJS::ClassBrowser] rendering...');
    const namespaces = Database.for(this.props.routeName).getNamespacedModules();

    return (
      <nav className="class-browser__listing">
        {namespaces.map(this.renderNamespace)}

        {this.props.withControls && (
          <div className="class-browser__controls">
            <Checkbox
              checked={!!Storage.get(PRIVATE_VISIBILITY_KEY)}
              onChange={this.togglePrivateVisibility}
              children="Show private"
            />
          </div>
        )}
      </nav>
    );
  },

  renderNamespace(ns) {
    if (ns.modules.length === 0) {
      return null;
    }

    const shouldDisplayName = Database.for(this.props.routeName).hasNamespaces();

    return (
      <div key={ns.name} className="class-browser__category">
        {shouldDisplayName && (
          <h3 className="class-browser__category-name">
            {ns.name}
          </h3>
        )}

        {ns.modules.map(this.renderModule)}
      </div>
    );
  },

  renderModule(doc) {
    const { routeName } = this.props;
    const { id } = doc;
    const isActive = this.props.activeModuleId === id;
    const className = classSet({
      'class-browser__entry': true,
      'class-browser__entry--active': isActive
    });

    const isPrivate = doc.isPrivate;

    if (isPrivate && !Storage.get(PRIVATE_VISIBILITY_KEY)) {
      return null;
    }

    return (
      <div key={id} className={className}>
        <Link
          ref={id}
          to={`${routeName}.module`}
          params={{ moduleId: encodeURIComponent(id) }}
          className="class-browser__entry-link"
        >
          {doc.name}

          {isPrivate && (
            <span className="class-browser__entry-link--private"> (private)</span>
          )}

          {doc.git && isItemHot(doc.git.lastCommittedAt) && <HotItemIndicator />}
        </Link>

        {isActive && this.renderModuleEntities(doc)}
      </div>
    );
  },

  renderModuleEntities(moduleDoc) {
    var docs = Database.for(this.props.routeName).getModuleEntities(moduleDoc.id);

    if (!docs.length) {
      return null;
    }

    var methodDocs = docs.filter(function(doc) {
      return doc.ctx.type === K.TYPE_FUNCTION;
    });

    var propertyDocs = docs.filter(function(doc) {
      return findWhere(doc.tags, { type: 'property' });
    });

    return (
      <ul className="class-browser__methods">
        {orderAwareSort(moduleDoc, methodDocs, 'id').map((doc) => {
          return this.renderModuleEntity(moduleDoc, doc);
        })}

        {orderAwareSort(moduleDoc, propertyDocs, 'id').map((doc) => {
          return this.renderModuleEntity(moduleDoc, doc);
        })}
      </ul>
    );
  },

  renderModuleEntity(moduleDoc, doc) {
    const entityPath = (doc.ctx.symbol || '') + doc.name;
    const routeName = this.props.routeName;

    return (
      <li key={doc.id} className="class-browser__methods-entity">
        <Link
          to={`${routeName}.module.entity`}
          params={{
            moduleId: encodeURIComponent(moduleDoc.id),
            entity: encodeURIComponent(entityPath)
          }}
          children={entityPath}
        />
      </li>
    );
  },

  togglePrivateVisibility() {
    Storage.set(PRIVATE_VISIBILITY_KEY, !Storage.get(PRIVATE_VISIBILITY_KEY));
  }
});

module.exports = ClassBrowser;