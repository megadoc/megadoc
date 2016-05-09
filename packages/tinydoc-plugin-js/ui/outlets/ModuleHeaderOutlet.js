const React = require('react');
const ModuleHeader = require('../components/ModuleHeader');
const { object, } = React.PropTypes;

tinydoc.outlets.add('CJS::ModuleHeader', {
  key: 'CJS::ModuleHeader',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
    },

    render() {
      const { documentNode } = this.props;
      const moduleNode = documentNode.type === 'DocumentEntity' ?
        documentNode.parentNode :
        documentNode
      ;

      return (
        <ModuleHeader
          {...this.props.$outletOptions}
          documentNode={moduleNode}
        />
      );
    }
  }),
});