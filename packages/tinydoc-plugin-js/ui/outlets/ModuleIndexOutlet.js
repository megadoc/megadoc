const React = require('react');
const { object, shape, bool, } = React.PropTypes;
const ModuleIndex = require('../components/ModuleIndex');

tinydoc.outlets.add('CJS::ModuleIndex', {
  key: 'CJS::ModuleIndex',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
      $outletOptions: shape({
        showFunctions: bool,
        showProperties: bool,
        showStaticMembers: bool,
      }),
    },

    render() {
      return (
        <ModuleIndex
          {...this.props.$outletOptions}
          documentNode={this.props.documentNode}
        />
      );
    }
  }),
});