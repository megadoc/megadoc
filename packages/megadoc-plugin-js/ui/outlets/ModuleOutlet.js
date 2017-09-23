const React = require('react');
const Module = require('../components/Module');
const { isNamespaceDocument } = require('../utils/DocClassifier');
const { object, } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'JS::Module',
  propTypes: {
    documentNode: object,
    namespaceNode: object,
  },

  render() {
    if (!this.props.documentNode || isNamespaceDocument(this.props.documentNode.properties)) {
      return null;
    }

    return (
      <Module {...this.props} />
    );
  }
});
