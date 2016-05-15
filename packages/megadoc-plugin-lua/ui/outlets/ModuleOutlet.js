const React = require('react');
const Module = require('../components/Module');
const { object } = React.PropTypes;

const ModuleOutlet = React.createClass({
  propTypes: {
    documentNode: object,
  },

  render() {
    const { documentNode } = this.props;

    return (
      <Module key={documentNode.uid} documentNode={documentNode} />
    );
  }
});

tinydoc.outlets.add('Lua::Module', {
  key: 'source',
  component: ModuleOutlet
});