const React = require('react');
const { object, shape, bool, } = React.PropTypes;
const NamespaceIndex = require('../components/NamespaceIndex');
const ModuleIndex = require('../components/ModuleIndex');

module.exports = React.createClass({
  displayName: 'JS::ModuleIndex',
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
      <div>
        <NamespaceIndex
          {...this.props.$outletOptions}
          documentNode={this.props.documentNode}
        />

        <ModuleIndex
          {...this.props.$outletOptions}
          documentNode={this.props.documentNode}
        />
      </div>
    );
  }
});
