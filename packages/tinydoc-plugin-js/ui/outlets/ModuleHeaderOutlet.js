const React = require('react');
const ModuleHeader = require('../components/ModuleHeader');
const { object, shape, bool, } = React.PropTypes;

tinydoc.outlets.add('CJS::ModuleHeader', {
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
      const moduleNode = documentNode.type === 'DocumentEntity' ?
        documentNode.parentNode :
        documentNode
      ;

      return (
        <div className="js-module-header-outlet">
          <ModuleHeader
            documentNode={moduleNode}
            generateAnchor={false}
          />

          {this.props.$outletOptions.showFilePath !== false && documentNode.filePath && (
            <p className="class-view__module-filepath">
              Defined in: {tinydoc.getRelativeFilePath(documentNode.filePath)}
            </p>
          )}

          {this.props.$outletOptions.showSummary !== false && moduleNode.summary && (
            <p>{moduleNode.summary}</p>
          )}
        </div>
      );
    }
  }),
});