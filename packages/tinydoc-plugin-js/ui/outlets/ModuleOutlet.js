const React = require('react');
const Module = require('components/Module');
const { object, } = React.PropTypes;

module.exports = function(api) {
  api.outlets.add('CJS::Module', {
    key: 'CJS::Module',
    component: React.createClass({
      propTypes: {
        documentNode: object,
        namespaceNode: object,
      },

      render() {
        return (
          <div>
            <Module
              namespaceNode={this.props.namespaceNode}
              documentNode={this.props.documentNode}
            />
          </div>
        );
      }
    }),
  });
};