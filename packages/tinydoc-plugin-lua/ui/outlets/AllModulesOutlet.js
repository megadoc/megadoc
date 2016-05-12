const React = require('react');
const Module = require('../components/Module');

const AllModulesOutlet = React.createClass({
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

tinydoc.outlets.add('Lua::AllModules', {
  key: 'source',
  component: AllModulesOutlet
});