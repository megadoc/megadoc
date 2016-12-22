const React = require('react');
const Module = require('../components/Module');
const { isNamespaceDocument } = require('../utils/DocClassifier');
const { object, } = React.PropTypes;

module.exports = {
  name: 'CJS::Module',
  key: 'CJS::Module',
  component: React.createClass({
    propTypes: {
      documentNode: object.isRequired,
      namespaceNode: object.isRequired,
    },

    render() {
      if (!this.props.documentNode || isNamespaceDocument(this.props.documentNode.properties)) {
        return null;
      }

      return (
        <Module {...this.props} />
      );
    }
  }),
}