const React = require('react');
const Module = require('../components/Module');
const { object } = React.PropTypes;

const AllModulesOutlet = React.createClass({
  propTypes: {
    namespaceNode: object,
  },

  render() {
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

module.exports = AllModulesOutlet;