const React = require('react');
const Index = require('../components/Index');
const { object } = React.PropTypes;

const IndexOutlet = React.createClass({
  propTypes: {
    namespaceNode: object,
  },

  render() {
    const { namespaceNode } = this.props;

    return (
      <Index namespaceNode={namespaceNode} />
    );
  }
});

module.exports = IndexOutlet;