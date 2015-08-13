var React = require("react");
var { Link } = require('react-router');
var Database = require('core/Database');
var classSet = require('utils/classSet');
var Storage = require('core/Storage');
var Checkbox = require('components/Checkbox');
var { sortBy, where } = require('lodash');

var PRIVATE_VISIBILITY_KEY = 'js:classBrowser:showPrivate';

var ClassBrowser = React.createClass({
  displayName: "ClassBrowser",

  render() {
    var classes = sortBy(this.props.classes, 'id').filter(function(classDoc) {
      return classDoc.tags.length > 0 || classDoc.description.full.length > 0;
    });

    return (
      <nav className="class-browser__listing">
        {classes.map(this.renderEntry)}

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

  renderEntry(doc) {
    var { id } = doc;
    var isActive = this.props.activeClassId === id;
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
        <Link to="js.class" params={{ classId: id }} className="class-browser__entry-link">
          {doc.ctx.name}

          {isPrivate && (
            <span className="class-browser__entry-link--private"> (private)</span>
          )}
        </Link>

        {isActive && this.renderClassMethods(doc)}
      </div>
    );
  },

  renderClassMethods(classEntry) {
    var docs = Database.getClassMethods(classEntry.id);

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
          return this.renderClassEntity(classEntry, doc, '@');
        })}

        {sortBy(methodDocs, 'id').map((doc) => {
          return this.renderClassEntity(classEntry, doc, '#');
        })}
      </ul>
    );
  },

  renderClassEntity(classEntry, doc, symbol) {
    return (
      <li key={doc.id} className="class-browser__methods-entity">
        <Link
          to="js.class"
          params={{ classId: classEntry.id }}
          query={{ entity: doc.id }}
        >
          {symbol}{doc.isConstructor ? 'constructor' : doc.ctx.name}
        </Link>
      </li>
    );
  },

  togglePrivateVisibility() {
    Storage.set(PRIVATE_VISIBILITY_KEY, !Storage.get(PRIVATE_VISIBILITY_KEY));
  }
});

module.exports = ClassBrowser;