const React = require('react');
const { object, } = React.PropTypes;
const NamespaceIndex = require('../components/NamespaceIndex');

module.exports = React.createClass({
  displayName: 'JS::NamespaceIndex',
  propTypes: {
    documentNode: object,
    namespaceNode: object,
  },

  render() {
    return (
      <NamespaceIndex
        documentNode={this.props.documentNode || this.props.namespaceNode}
      />
    );
  }
});
