const React = require('react');
const Link = require('components/Link');
const { object } = React.PropTypes;

const Index = React.createClass({
  propTypes: {
    namespaceNode: object,
  },

  render() {
    const { namespaceNode } = this.props;
    const classes = getByDisplayType(namespaceNode, [ 'class' ]);
    const modules = getByDisplayType(namespaceNode, [ 'module', 'table' ]);
    const functions = getByDisplayType(namespaceNode, [ 'function' ]);
    const others = getRemainingDocuments(namespaceNode, [
      classes,
      modules,
      functions,
    ]);

    return (
      <div className="lua-index-outlet">
        {namespaceNode.title && (
          <h1>{namespaceNode.title}</h1>
        )}

        {classes.length > 0 && this.renderGroupByContextType('Classes', classes)}
        {modules.length > 0 && this.renderGroupByContextType('Modules', modules)}
        {functions.length > 0 && this.renderGroupByContextType('Functions', functions)}
        {others.length > 0 && this.renderGroupByContextType('Other', others)}
      </div>
    );
  },

  renderGroupByContextType(title, documents) {
    return (
      <div>
        <h2 className="lua-doc-group__header">
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
    return typeNames.indexOf(x.properties.ctx.type) > -1;
  });
}

function getRemainingDocuments(documentNode, lists) {
  const usedUIDs = lists.reduce(function(map, list) {
    list.forEach(x => { map[x.uid] = true });
    return map;
  }, {});

  return documentNode.documents.filter(x => !(x.uid in usedUIDs));
}

module.exports = Index;
