const React = require('react');
const ModuleHeader = require('../components/ModuleHeader');
const { object, shape, bool, } = React.PropTypes;

megadoc.outlets.add('CJS::ModuleHeader', {
  key: 'CJS::ModuleHeader',
  component: React.createClass({
    propTypes: {
      documentNode: object,
      namespaceNode: object,
      $outletOptions: shape({
        showFilePath: bool,
      })
    },

    render() {
      const { documentNode } = this.props;

      return (
        <div className="js-module-header-outlet">
          <ModuleHeader
            documentNode={documentNode}
            showSourcePaths={this.props.$outletOptions.showFilePath !== false}
            generateAnchor={false}
          />
        </div>
      );
    }
  }),
});