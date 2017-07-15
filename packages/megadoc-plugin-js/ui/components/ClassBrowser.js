const React = require("react");
const console = require("console");
const Link = require('components/Link');
const classSet = require('utils/classSet');
const Checkbox = require('components/Checkbox');
const Icon = require('components/Icon');
const HotItemIndicator = require('components/HotItemIndicator');
const { sortBy } = require('lodash');
const orderAwareSort = require('../utils/orderAwareSort');
const DocClassifier = require('../utils/DocClassifier');
const { object, bool, } = React.PropTypes;

var ClassBrowser = React.createClass({
  propTypes: {
    withControls: bool,
    documentNode: object,
    documentEntityNode: object,
    namespaceNode: object,
    flat: bool,
  },

  getInitialState() {
    return {
      showPrivateModules: false
    };
  },

  getDefaultProps() {
    return {
      withControls: true
    };
  },

  // shouldComponentUpdate: function(nextProps) {
  //   return (
  //     nextProps.documentEntityNode !== this.props.documentEntityNode ||
  //     nextProps.documentNode !== this.props.documentNode ||
  //     nextProps.namespaceNode !== this.props.namespaceNode
  //   );
  // },

  render() {
    const rootDocuments = this.props.namespaceNode.documents;
    const genericNamespace = {
      id: '__general__',
      title: '[General]',
      documents: [],
      meta: {}
    };

    const hasPrivateModules = rootDocuments.some(x => {
      return x.documents.some(y => DocClassifier.isPrivate(y.properties));
    });

    const namespaces = rootDocuments.reduce(function(list, node) {
      if (node.documents.length) {
        list.push(node);
      }
      else {
        list[0].documents.push(node);
      }

      return list;
    }, [ genericNamespace ]).sort(function(a, b) {
      if (a.id === '__general__') {
        return 1;
      }
      else {
        return a.id > b.id ? 1 : -1;
      }
    });

    const shouldDisplayName = namespaces.length > 1;

    return (
      <nav className="class-browser__listing">
        {namespaces.map(this.renderNamespace.bind(null, shouldDisplayName))}

        {this.props.withControls && hasPrivateModules && (
          <div className="class-browser__controls">
            <Checkbox
              checked={this.state.showPrivateModules}
              onChange={this.togglePrivateVisibility}
              children="Show private"
            />
          </div>
        )}
      </nav>
    );
  },

  renderNamespace(shouldDisplayName, ns) {
    let documents = ns.documents;
    const { config } = this.props.namespaceNode;
    const shouldHidePrivateModules = (
      config.showPrivateModules === false ||
      !this.state.showPrivateModules
    );

    if (shouldHidePrivateModules) {
      documents = ns.documents.filter(x => {
        return !DocClassifier.isPrivate(x.properties);
      });
    }

    if (documents.length === 0) {
      return null;
    }

    const hasSelfDocument = ns.id !== '__general__' && (
      ns.properties ||
      config.linkToNamespacesInBrowser
    );

    return (
      <div key={ns.id} className="class-browser__category">
        {shouldDisplayName && (
          <h3 className="class-browser__category-name">
            {hasSelfDocument ? (
              <Link to={ns} children={ns.title} />
            ) : (
              ns.title
            )}
          </h3>
        )}

        {hasSelfDocument && this.props.documentNode === ns && (
          this.renderModuleEntities(ns.entities)
        )}

        {sortBy(documents, 'id').map(this.renderModule)}
      </div>
    );
  },

  renderModule(docNode) {
    const doc = docNode.properties;
    const { id } = doc;
    const isPrivate = DocClassifier.isPrivate(doc);
    const isActive = this.props.documentNode === docNode;
    const className = classSet({
      'class-browser__entry': true,
      'class-browser__entry--active': isActive
    });

    return (
      <div key={docNode.uid} className={className}>
        <Link ref={id} to={docNode} className="class-browser__entry-link">
          {doc.name}

          {isPrivate && this.props.namespaceNode.config.markPrivateModules !== false && (
            <span
              className="class-browser__entry-link--private"
              title="This module is private"> <Icon className="icon-cube" />
            </span>
          )}

          {doc.git && <HotItemIndicator timestamp={doc.git.lastCommittedAt} />}
        </Link>

        {isActive && !this.props.flat && this.renderModuleEntities(docNode)}
      </div>
    );
  },

  renderModuleEntities(documentNode) {
    if (!documentNode.entities || !documentNode.entities.length) {
      return null;
    }

    if (!documentNode.properties.tags) {
      console.log('weird docNode:', documentNode);
    }

    const entityDocuments = orderAwareSort.asNodes(documentNode, documentNode.entities, 'id');

    return (
      <ul className="class-browser__methods">
        {entityDocuments.map(this.renderEntity)}
      </ul>
    );
  },

  renderEntity(node) {
    return (
      <li key={node.uid} className="class-browser__methods-entity">
        <Link
          to={node}
          children={(node.properties.symbol || '') + node.properties.name}
          title={node.title}
        />
      </li>
    );
  },

  togglePrivateVisibility() {
    this.setState({
      showPrivateModules: !this.state.showPrivateModules
    });
  }
});

module.exports = ClassBrowser;