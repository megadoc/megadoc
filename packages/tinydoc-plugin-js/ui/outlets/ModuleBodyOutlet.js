const React = require('react');
const ModuleBody = require('../components/ModuleBody');
const { object, } = React.PropTypes;

tinydoc.outlets.add('CJS::ModuleBody', {
  key: 'CJS::ModuleBody',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      if (!this.props.documentNode.properties) {
        return null;
      }

      const { documentNode } = this.props;
      const moduleNode = documentNode.type === 'DocumentEntity' ?
        documentNode.parentNode :
        documentNode
      ;

      return (
        <ModuleBody
          documentNode={moduleNode}
        />
      );
    }
  }),
});