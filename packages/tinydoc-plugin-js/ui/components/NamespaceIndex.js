const React = require('react');
const Link = require('components/Link');

const NamespaceIndex = React.createClass({
  render() {
    const { documentNode } = this.props;

    return (
      <table>
        {documentNode.documents.map(this.renderModuleSummaryRecord)}
      </table>
    );
  },

  renderModuleSummaryRecord(node) {
    if (!node.properties) {
      return null;
    }

    return (
      <tr key={node.uid}>
        <td>
          <Link to={node.meta.href}>{node.properties.name}</Link>
        </td>

        <td>
          {node.summary}
        </td>
      </tr>
    );
  }
});

module.exports = NamespaceIndex;
