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
        showSummary: bool,
      })
    },

    render() {
      const { documentNode } = this.props;

      return (
        <div className="js-module-header-outlet">
          <ModuleHeader
            documentNode={documentNode}
            generateAnchor={false}
          />

          {this.props.$outletOptions.showFilePath !== false && documentNode.filePath && (
            <p className="class-view__module-filepath">
              Defined in: {megadoc.getRelativeFilePath(documentNode.filePath)}
            </p>
          )}

          {this.props.$outletOptions.showSummary !== false && documentNode.summary && (
            <p>{documentNode.summary}</p>
          )}
        </div>
      );
    }
  }),
});