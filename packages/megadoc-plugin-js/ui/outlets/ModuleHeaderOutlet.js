const React = require('react');
const ModuleHeader = require('../components/ModuleHeader');
const { object, shape, bool, } = React.PropTypes;

module.exports = React.createClass({
  displayName: 'JS::ModuleHeader',

  propTypes: {
    documentNode: object,
    namespaceNode: object,
    $outletOptions: shape({
      showFilePath: bool,
    })
  },

  render() {
    const { config } = this.props.namespaceNode;
    const options = this.props.$outletOptions;

    return (
      <div className="js-module-header-outlet">
        <ModuleHeader
          documentNode={this.props.documentNode || this.props.namespaceNode}
          showSourcePaths={
            options.showFilePath !== false &&
            config.showSourcePaths !== false
          }
          showNamespace={
            options.showNamespace !== false &&
            config.showNamespaceInModuleHeader !== false
          }
          generateAnchor={false}
        />
      </div>
    );
  }
});
