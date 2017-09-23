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
    return (
      <div className="js-module-header-outlet">
        <ModuleHeader
          documentNode={this.props.documentNode || this.props.namespaceNode}
          showSourcePaths={this.props.$outletOptions.showFilePath !== false}
          generateAnchor={false}
        />
      </div>
    );
  }
});
