const React = require('react');
const Link = require('components/Link');
const DocClassifier = require('../utils/DocClassifier');
const { object } = React.PropTypes;

const NamespaceIndex = React.createClass({
  propTypes: {
    documentNode: object,
  },

  render() {
    const { documentNode } = this.props;
    const classes = getByDisplayType(documentNode, [ 'Class', 'Factory' ]);
    const functions = getByDisplayType(documentNode, [ 'Function' ]);
    const namespaces = getByDisplayType(documentNode, [ 'Namespace' ]);
    const others = getRemainingDocuments(documentNode, [
      classes,
      functions,
      namespaces
    ]);

    return (
      <div className="js-document-index">
        {namespaces.length > 0 && this.renderGroupByContextType('Namespaces', namespaces)}
        {classes.length > 0 && this.renderGroupByContextType('Classes', classes)}
        {functions.length > 0 && this.renderGroupByContextType('Functions', functions)}
        {others.length > 0 && this.renderGroupByContextType('Other', others)}
      </div>
    );
  },

  renderGroupByContextType(title, documents) {
    return (
      <div>
        <h2 className="doc-group__header">
          {title}
        </h2>

        {this.renderGroup(documents)}
      </div>
    )
  },

  renderGroup(documents) {
    return (
      <table>
        <tbody>
          {documents.map(this.renderModuleSummaryRecord)}
        </tbody>
      </table>
    );
  },

  renderModuleSummaryRecord(node) {
    return (
      <tr key={node.uid}>
        <td>
          <Link to={node}>{node.properties && node.properties.name || node.title}</Link>
        </td>

        <td>
          {node.summary || <em className="type-mute">No summary provided.</em>}
        </td>
      </tr>
    );
  }
});

function getByDisplayType(documentNode, typeNames) {
  return documentNode.documents.filter(x => {
    return typeNames.indexOf(DocClassifier.getDisplayType(x)) > -1;
  });
}

function getRemainingDocuments(documentNode, lists) {
  const usedUIDs = lists.reduce(function(map, list) {
    list.forEach(x => map[x.uid] = true);
    return map;
  }, {});

  return documentNode.documents.filter(x => !(x.uid in usedUIDs));
}

module.exports = NamespaceIndex;
