const React = require('react');
const Module = require('../components/Module');
const { object } = React.PropTypes;

const ModuleOutlet = React.createClass({
  propTypes: {
    namespaceNode: object,
    documentNode: object,
  },

  render() {
    const { documentNode, namespaceNode } = this.props;

    if (!documentNode && namespaceNode) {
      return this.renderNamespace();
    }
    else {
      return this.renderModule(documentNode);
    }
  },

  renderNamespace() {
    return (
      <div className="lua">
        {this.props.namespaceNode.documents.map(this.renderModule)}
      </div>
    );
  },

  renderModule(documentNode) {
    return (
      <Module key={documentNode.uid} documentNode={documentNode} />
    );
  }
});

module.exports = ModuleOutlet;